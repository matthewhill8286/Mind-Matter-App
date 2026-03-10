import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import type { MoodCheckIn } from '@/lib/types';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const moodScore = {
  Great: 5,
  Good: 4,
  Okay: 3,
  Low: 2,
  Bad: 1,
};

function dayKey(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

function labelFromKey(k: string, days: number) {
  const [y, m, d] = k.split('-').map((x) => Number(x));
  const dt = new Date(y, m - 1, d);
  if (days > 7) {
    return dt.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
  }
  return dt.toLocaleDateString(undefined, { weekday: 'short' });
}

export default function MoodChart({ items }: Readonly<{ items: MoodCheckIn[] }>) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [days, setDays] = useState(7);

  const data = useMemo(() => {
    const today = new Date();
    const keys: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      keys.push(dayKey(d.toISOString()));
    }

    const byDay = new Map<string, MoodCheckIn[]>();
    for (const it of items) {
      const k = dayKey(it.created_at);
      byDay.set(k, [...(byDay.get(k) ?? []), it]);
    }

    return keys.map((k) => {
      const list = byDay.get(k) ?? [];
      if (!list.length)
        return {
          key: k,
          label: labelFromKey(k, days),
          moodAvg: null as number | null,
          stressAvg: null as number | null,
          sleepAvg: null as number | null,
        };

      const moodAvg = list.reduce((a, x) => a + moodScore[x.mood ?? 'Okay'], 0) / list.length;
      const stressAvg = list.reduce((a, x) => a + (x.stress || 0), 0) / list.length;
      // @ts-expect-error - needs adding to the schema
      const sleepAvg = list.reduce((a, x) => a + (x.sleep_hours || 0), 0) / list.length;
      return { key: k, label: labelFromKey(k, days), moodAvg, stressAvg, sleepAvg };
    });
  }, [items, days]);

  const trends = useMemo(() => {
    if (data.length < 2) return null;

    const mid = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, mid);
    const secondHalf = data.slice(mid);

    const getAvg = (arr: typeof data, key: 'moodAvg' | 'stressAvg' | 'sleepAvg') => {
      const valid = arr.filter((d) => d[key] !== null);
      if (valid.length === 0) return null;
      return valid.reduce((a, b) => a + (b[key] as number), 0) / valid.length;
    };

    const mood1 = getAvg(firstHalf, 'moodAvg');
    const mood2 = getAvg(secondHalf, 'moodAvg');
    const stress1 = getAvg(firstHalf, 'stressAvg');
    const stress2 = getAvg(secondHalf, 'stressAvg');
    const sleep1 = getAvg(firstHalf, 'sleepAvg');
    const sleep2 = getAvg(secondHalf, 'sleepAvg');

    const calcChange = (v1: number | null, v2: number | null) => {
      if (v1 === null || v2 === null || v1 === 0) return null;
      return ((v2 - v1) / v1) * 100;
    };

    return {
      mood: calcChange(mood1, mood2),
      stress: calcChange(stress1, stress2),
      sleep: calcChange(sleep1, sleep2),
    };
  }, [data]);

  const maxMood = 5;
  const maxStress = 10;
  const maxSleep = 12;

  const barWidth = days > 30 ? 8 : days > 7 ? 20 : 34;

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 14 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <Text style={{ fontWeight: '900', color: colors.text }}>
          {t('common.moodTrends')} ({days}d)
        </Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[7, 30, 90].map((d) => (
            <Pressable
              key={d}
              onPress={() => setDays(d)}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
                backgroundColor: days === d ? colors.primary : colors.divider,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  color: days === d ? colors.onPrimary : colors.mutedText,
                }}
              >
                {d}d
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#a07b55',
              opacity: 0.45,
            }}
          />
          <Text style={{ fontSize: 10, opacity: 0.7, color: colors.text }}>Mood</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View
            style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#333', opacity: 0.65 }}
          />
          <Text style={{ fontSize: 10, opacity: 0.7, color: colors.text }}>Stress</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#7b79c9',
              opacity: 0.65,
            }}
          />
          <Text style={{ fontSize: 10, opacity: 0.7, color: colors.text }}>Sleep</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexDirection: 'row',
          justifyContent: days <= 7 ? 'space-between' : 'flex-start',
          gap: days > 7 ? 8 : 0,
          marginTop: 12,
          minWidth: '100%',
        }}
      >
        {data.map((d, idx) => {
          const h = d.moodAvg == null ? 6 : Math.max(6, (d.moodAvg / maxMood) * 72);
          const stressY =
            d.stressAvg == null ? null : Math.max(0, Math.min(72, (d.stressAvg / maxStress) * 72));
          const sleepY =
            d.sleepAvg == null ? null : Math.max(0, Math.min(72, (d.sleepAvg / maxSleep) * 72));

          // Only show labels for every few days if 30 or 90 to avoid clutter
          const showLabel =
            days <= 7 || (days === 30 && idx % 5 === 0) || (days === 90 && idx % 14 === 0);

          return (
            <View key={d.key} style={{ alignItems: 'center', width: barWidth }}>
              <View style={{ height: 80, justifyContent: 'flex-end', alignItems: 'center' }}>
                {stressY == null ? null : (
                  <View
                    style={{
                      position: 'absolute',
                      bottom: stressY,
                      width: days > 30 ? 4 : 6,
                      height: days > 30 ? 4 : 6,
                      borderRadius: 3,
                      backgroundColor: colors.text,
                      opacity: 0.65,
                      zIndex: 2,
                    }}
                  />
                )}
                {sleepY == null ? null : (
                  <View
                    style={{
                      position: 'absolute',
                      bottom: sleepY,
                      width: days > 30 ? 4 : 6,
                      height: days > 30 ? 4 : 6,
                      borderRadius: 3,
                      backgroundColor: '#7b79c9',
                      opacity: 0.65,
                      zIndex: 1,
                    }}
                  />
                )}
                <View
                  style={{
                    width: days > 30 ? 6 : days > 7 ? 10 : 14,
                    height: h,
                    borderRadius: 7,
                    backgroundColor: colors.primary,
                    opacity: d.moodAvg == null ? 0.18 : 0.45,
                  }}
                />
              </View>
              <Text
                style={{
                  fontSize: 10,
                  opacity: 0.7,
                  marginTop: 6,
                  color: colors.text,
                  textAlign: 'center',
                }}
              >
                {showLabel ? d.label : ''}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {trends && (
        <View
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.divider,
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
            {t('common.moodInsights')}
          </Text>
          {trends.mood !== null && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                  backgroundColor:
                    trends.mood > 2 ? '#4caf5022' : trends.mood < -2 ? '#f4433622' : '#9e9e9e22',
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '800',
                    color: trends.mood > 2 ? '#4caf50' : trends.mood < -2 ? '#f44336' : '#9e9e9e',
                  }}
                >
                  {trends.mood > 2
                    ? t('common.moodTrendingUp')
                    : trends.mood < -2
                      ? t('common.moodTrendingDown')
                      : t('common.moodStable')}
                </Text>
              </View>
              <Text style={{ fontSize: 11, color: colors.text, flex: 1 }}>
                {Math.abs(trends.mood) <= 2
                  ? t('common.moodStayedStable')
                  : trends.mood > 0
                    ? t('common.moodImprovement', { percent: Math.abs(Math.round(trends.mood)) })
                    : t('common.moodDecline', { percent: Math.abs(Math.round(trends.mood)) })}
              </Text>
            </View>
          )}
          {trends.stress !== null && Math.abs(trends.stress) > 5 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                  backgroundColor: trends.stress < 0 ? '#4caf5022' : '#f4433622',
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '800',
                    color: trends.stress < 0 ? '#4caf50' : '#f44336',
                  }}
                >
                  STRESS
                </Text>
              </View>
              <Text style={{ fontSize: 11, color: colors.text, flex: 1 }}>
                {trends.stress < 0
                  ? t('common.stressImprovement', { percent: Math.abs(Math.round(trends.stress)) })
                  : t('common.stressDecline', { percent: Math.abs(Math.round(trends.stress)) })}
              </Text>
            </View>
          )}
          {trends.sleep !== null && Math.abs(trends.sleep) > 5 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                  backgroundColor: trends.sleep > 0 ? '#4caf5022' : '#f4433622',
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '800',
                    color: trends.sleep > 0 ? '#4caf50' : '#f44336',
                  }}
                >
                  SLEEP
                </Text>
              </View>
              <Text style={{ fontSize: 11, color: colors.text, flex: 1 }}>
                {trends.sleep > 0
                  ? t('common.sleepImprovement', { percent: Math.abs(Math.round(trends.sleep)) })
                  : t('common.sleepDecline', { percent: Math.abs(Math.round(trends.sleep)) })}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
