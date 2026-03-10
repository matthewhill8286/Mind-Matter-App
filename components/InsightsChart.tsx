// ============================================================
// MindSport — Insights & Charts Layer
// Outlier-preserving decimation + windowed rendering
// Victory Native (Skia-based) — UI thread rendering
// ============================================================

import { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CartesianChart, Line, Area, useChartPressState } from 'victory-native';
import { Circle } from '@shopify/react-native-skia';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { authStore } from '@/store/authStore';

// ============================================================
// TYPES
// ============================================================

interface MoodDataPoint {
  logged_at: string;
  mood_score: number;
  energy_score: number;
  stress_score: number;
  sport_context: string | null;
}

interface DecimatedPoint extends MoodDataPoint {
  isOutlier: boolean; // flagged for visual emphasis on the chart
}

type TimeWindow = '7d' | '30d' | '90d';

// ============================================================
// OUTLIER-PRESERVING DECIMATION
// Never drop a local minimum or maximum.
// Reduces point count while preserving clinical signal.
// ============================================================

function decimateWithOutliers(data: MoodDataPoint[], targetPoints: number): DecimatedPoint[] {
  if (data.length <= targetPoints) {
    return data.map((d) => ({ ...d, isOutlier: false }));
  }

  // Step 1 — identify local minima, maxima, and sharp transitions
  const outlierIndices = new Set<number>();

  for (let i = 1; i < data.length - 1; i++) {
    const prev = data[i - 1].mood_score;
    const curr = data[i].mood_score;
    const next = data[i + 1].mood_score;

    const isLocalMin = curr < prev && curr < next;
    const isLocalMax = curr > prev && curr > next;

    // 2+ point swing = clinically significant — always preserve
    const isSharpMove = Math.abs(curr - prev) >= 2 || Math.abs(curr - next) >= 2;

    if (isLocalMin || isLocalMax || isSharpMove) {
      outlierIndices.add(i);
    }
  }

  // Always keep first and last points
  outlierIndices.add(0);
  outlierIndices.add(data.length - 1);

  // Step 2 — fill remaining slots with evenly spaced points
  const remainingSlots = Math.max(targetPoints - outlierIndices.size, 0);
  const nonOutlierIndices = Array.from({ length: data.length }, (_, i) => i).filter(
    (i) => !outlierIndices.has(i),
  );

  const step = Math.floor(nonOutlierIndices.length / Math.max(remainingSlots, 1));
  const sampledIndices = new Set<number>(outlierIndices);

  for (let i = 0; i < nonOutlierIndices.length && sampledIndices.size < targetPoints; i += step) {
    sampledIndices.add(nonOutlierIndices[i]);
  }

  // Step 3 — return sorted, flagged decimated points
  return Array.from(sampledIndices)
    .sort((a, b) => a - b)
    .map((i) => ({
      ...data[i],
      isOutlier: outlierIndices.has(i) && i !== 0 && i !== data.length - 1,
    }));
}

// ============================================================
// AGGREGATION UTILITIES
// Mean alone misleads — we also compute stdDev and slope
// ============================================================

function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  return Math.sqrt(mean(values.map((v) => Math.pow(v - avg, 2))));
}

// Linear regression slope — positive = improving, negative = declining
function linearSlope(values: number[]): number {
  if (values.length < 2) return 0;
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = mean(values);
  const num = values.reduce((sum, y, x) => sum + (x - xMean) * (y - yMean), 0);
  const denom = values.reduce((sum, _, x) => sum + Math.pow(x - xMean, 2), 0);
  return denom === 0 ? 0 : num / denom;
}

function formatSlope(slope: number): { label: string; color: string } {
  if (slope > 0.1) return { label: 'Improving ↑', color: '#5ddfb0' };
  if (slope < -0.1) return { label: 'Declining ↓', color: '#f76b6b' };
  return { label: 'Stable →', color: '#4fa3f7' };
}

// ============================================================
// WINDOW CONFIG
// Target point counts per window — drives decimation aggressiveness
// ============================================================

const WINDOW_CONFIG: Record<TimeWindow, { days: number; targetPoints: number; label: string }> = {
  '7d': { days: 7, targetPoints: 14, label: '7 days' }, // no decimation needed
  '30d': { days: 30, targetPoints: 30, label: '30 days' }, // light decimation
  '90d': { days: 90, targetPoints: 25, label: '90 days' }, // aggressive decimation
};

// ============================================================
// DATA HOOK
// Fetches 90-day superset once. Windowing + decimation = client-side.
// No refetch per window change — React Query cache handles it.
// ============================================================

function useMoodInsights() {
  const { profile } = authStore();

  const { data: rawData = [], isLoading } = useQuery({
    queryKey: ['mood-insights', profile!.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mood_logs')
        .select('logged_at, mood_score, energy_score, stress_score, sport_context')
        .eq('user_id', profile!.user_id)
        .gte('logged_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .order('logged_at', { ascending: true });

      if (error) throw error;
      return (data || []).map((d) => ({
        logged_at: d.logged_at,
        mood_score: d.mood_score || 0,
        energy_score: d.energy_score || 0,
        stress_score: d.stress_score || 0,
        sport_context: d.sport_context,
      }));
    },
    enabled: !!profile?.user_id,
    staleTime: 1000 * 60 * 5, // 5 min stale — mood data changes infrequently
    gcTime: 1000 * 60 * 60, // keep in memory for 1 hour
  });

  return { rawData, isLoading };
}

// ============================================================
// STATS HOOK
// Computed from windowed data — full fidelity, not decimated
// Decimation is only for rendering, never for numbers
// ============================================================

function useInsightStats(data: MoodDataPoint[]) {
  return useMemo(() => {
    if (!data.length) return null;

    const moodScores = data.map((d) => d.mood_score);
    const stressScores = data.map((d) => d.stress_score);
    const energyScores = data.map((d) => d.energy_score);
    const slope = linearSlope(moodScores);

    // Worst 3-day stretch — find window with lowest avg mood
    let worstStretch = { start: '', end: '', avg: 10 };
    for (let i = 0; i < data.length - 2; i++) {
      const windowAvg = mean([
        data[i].mood_score,
        data[i + 1]?.mood_score ?? data[i].mood_score,
        data[i + 2]?.mood_score ?? data[i].mood_score,
      ]);
      if (windowAvg < worstStretch.avg) {
        worstStretch = {
          start: data[i].logged_at,
          end: data[Math.min(i + 2, data.length - 1)].logged_at,
          avg: windowAvg,
        };
      }
    }

    return {
      avgMood: mean(moodScores).toFixed(1),
      avgStress: mean(stressScores).toFixed(1),
      avgEnergy: mean(energyScores).toFixed(1),
      stdDev: standardDeviation(moodScores).toFixed(1),
      trend: formatSlope(slope),
      slope,
      worstStretch,
      totalLogs: data.length,
    };
  }, [data]);
}

// ============================================================
// INSIGHTS SCREEN
// ============================================================

export default function InsightsScreen() {
  const [activeWindow, setActiveWindow] = useState<TimeWindow>('7d');
  const { rawData, isLoading } = useMoodInsights();
  const { state: pressState, isActive } = useChartPressState({
    x: 0,
    y: { mood_score: 0 },
  });

  // Window filter — client-side slice, zero DB calls
  const windowedData = useMemo(() => {
    const { days } = WINDOW_CONFIG[activeWindow];
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return rawData.filter((d) => new Date(d.logged_at).getTime() >= cutoff);
  }, [rawData, activeWindow]);

  // Decimated data for Skia rendering only
  const chartData = useMemo(() => {
    const { targetPoints } = WINDOW_CONFIG[activeWindow];
    return decimateWithOutliers(windowedData, targetPoints);
  }, [windowedData, activeWindow]);

  // Stats computed from full windowed data — never decimated
  const stats = useInsightStats(windowedData);

  if (isLoading) return <LoadingState />;
  if (!rawData.length) return <EmptyState />;

  return (
    <View style={styles.container}>
      {/* Window selector */}
      <View style={styles.windowSelector}>
        {(Object.keys(WINDOW_CONFIG) as TimeWindow[]).map((w) => (
          <Pressable
            key={w}
            style={[styles.windowBtn, activeWindow === w && styles.windowBtnActive]}
            onPress={() => setActiveWindow(w)}
          >
            <Text style={[styles.windowBtnText, activeWindow === w && styles.windowBtnTextActive]}>
              {WINDOW_CONFIG[w].label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Stats row — full fidelity numbers, not from decimated data */}
      {stats && (
        <View style={styles.statsRow}>
          <StatCard label="Avg Mood" value={`${stats.avgMood}/10`} />
          <StatCard label="Avg Stress" value={`${stats.avgStress}/10`} />
          <StatCard label="Volatility" value={`±${stats.stdDev}`} />
          <StatCard label="Trend" value={stats.trend.label} valueColor={stats.trend.color} />
        </View>
      )}

      {/* Mood chart — Skia-rendered, windowed + decimated */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Mood Score</Text>
        <CartesianChart
          data={chartData}
          xKey="logged_at"
          yKeys={['mood_score']}
          domain={{ y: [0, 10] }}
          chartPressState={pressState}
          axisOptions={{
            tickCount: { x: 5, y: 5 },
            labelColor: '#6b7280',
            lineColor: '#252a3a',
          }}
        >
          {({ points, chartBounds }) => (
            <>
              {/* Subtle area fill */}
              <Area
                points={points.mood_score}
                y0={chartBounds.bottom}
                color="#5ddfb0"
                opacity={0.08}
                animate={{ type: 'timing', duration: 400 }}
              />

              {/* Main trend line */}
              <Line
                points={points.mood_score}
                color="#5ddfb0"
                strokeWidth={2}
                animate={{ type: 'timing', duration: 400 }}
              />

              {/* Outlier dots — clinically significant points always rendered */}
              {chartData.map((d, i) => {
                if (!d.isOutlier) return null;
                const point = points.mood_score[i];
                if (!point) return null;
                return (
                  <Circle
                    key={i}
                    cx={point.x}
                    cy={point.y ?? 0}
                    r={4}
                    color={d.mood_score <= 3 ? '#f76b6b' : '#f7a24f'}
                  />
                );
              })}

              {/* Touch indicator */}
              {isActive && (
                <Circle
                  cx={pressState.x.position}
                  cy={pressState.y.mood_score.position}
                  r={6}
                  color="#fff"
                />
              )}
            </>
          )}
        </CartesianChart>
      </View>

      {/* Press tooltip */}
      {isActive && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipScore}>
            {Math.round(pressState.y.mood_score.value.value)}/10
          </Text>
          <Text style={styles.tooltipDate}>
            {new Date(pressState.x.value).toLocaleDateString()}
          </Text>
        </View>
      )}

      {/* Worst stretch callout — only shown when clinically relevant */}
      {stats && stats.worstStretch.avg < 5 && (
        <View style={styles.callout}>
          <Text style={styles.calloutTitle}>⚠ Difficult stretch detected</Text>
          <Text style={styles.calloutBody}>
            Your lowest 3-day average this period was {stats.worstStretch.avg.toFixed(1)}/10. Your
            AI coach has context on this — consider checking in.
          </Text>
        </View>
      )}
    </View>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function StatCard({
  label,
  value,
  valueColor = '#e8eaf0',
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function LoadingState() {
  return (
    <View style={styles.center}>
      <Text style={styles.muted}>Loading insights…</Text>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.center}>
      <Text style={styles.muted}>Log your mood for a few days to see your insights.</Text>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0f14', padding: 20 },
  windowSelector: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  windowBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#252a3a',
    alignItems: 'center',
  },
  windowBtnActive: { backgroundColor: 'rgba(93,223,176,0.12)', borderColor: '#5ddfb0' },
  windowBtnText: { fontSize: 12, color: '#6b7280' },
  windowBtnTextActive: { color: '#5ddfb0' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#151820',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#252a3a',
  },
  statValue: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  statLabel: { fontSize: 10, color: '#6b7280' },
  chartContainer: { height: 220, marginBottom: 16 },
  chartTitle: { fontSize: 13, fontWeight: '600', color: '#e8eaf0', marginBottom: 10 },
  tooltip: { alignItems: 'center', marginBottom: 16 },
  tooltipScore: { fontSize: 22, fontWeight: '800', color: '#e8eaf0' },
  tooltipDate: { fontSize: 11, color: '#6b7280' },
  callout: {
    backgroundColor: 'rgba(247,107,107,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(247,107,107,0.2)',
    borderRadius: 12,
    padding: 16,
  },
  calloutTitle: { fontSize: 13, fontWeight: '700', color: '#f76b6b', marginBottom: 6 },
  calloutBody: { fontSize: 12, color: '#6b7280', lineHeight: 18 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: '#6b7280', fontSize: 13 },
});
