import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Platform } from 'react-native';
import ScreenHeader from '@/components/ScreenHeader';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { calculateWellnessScore } from '@/lib/wellness';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/useSubscription';
import { Colors, UI } from '@/constants/theme';
import { AFFIRMATIONS } from '@/constants/affirmations';
import { useMoodStore } from '@/store/useMoodStore';
import { useJournalStore } from '@/store/useJournalStore';
import { useSleepStore } from '@/store/useSleepStore';
import { useMindfulnessStore } from '@/store/useMindfulnessStore';
import { useStressHistoryStore } from '@/store/useStressHistoryStore';
import { useProfileStore } from '@/store/useProfileStore';

import ScoreCard from '@/components/ScoreCard';
import MoodChart from '@/components/MoodChart';
import { SkeletonRect } from '@/components/Skeleton';
import { MiniStat } from '@/components/MiniStat';
import { HorizontalActionList } from '@/components/HorizontalActionList';

export default function Home() {
  const { t } = useTranslation();
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const { isExpired } = useSubscription();

  const [loading, setLoading] = useState(true);
  const { assessment, fetchAssessment } = useProfileStore();
  const { moodCheckIns, fetchMoodCheckIns } = useMoodStore();
  const { journalEntries, fetchJournalEntries } = useJournalStore();
  const { sleepEntries, fetchSleepEntries } = useSleepStore();
  const { mindfulnessHistory, fetchMindfulnessHistory } = useMindfulnessStore();
  const { stressHistory, fetchStressHistory } = useStressHistoryStore();

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([
        fetchMoodCheckIns(),
        fetchJournalEntries(),
        fetchAssessment(),
        fetchStressHistory(),
        fetchMindfulnessHistory(),
        fetchSleepEntries(),
      ]);
      setLoading(false);
    })();
  }, [
    fetchAssessment,
    fetchJournalEntries,
    fetchMindfulnessHistory,
    fetchMoodCheckIns,
    fetchSleepEntries,
    fetchStressHistory,
  ]);

  const allData = useMemo(
    () => ({
      moodCheckIns,
      journalEntries,
      assessment,
      stressHistory,
      mindfulnessHistory,
      sleepEntries,
    }),
    [moodCheckIns, journalEntries, assessment, stressHistory, mindfulnessHistory, sleepEntries],
  );

  const wellness = useMemo(() => calculateWellnessScore(allData), [allData]);

  const moodCount = moodCheckIns?.length || 0;
  const journalCount = journalEntries?.length || 0;

  const affirmation = useMemo(() => {
    const today = new Date().toDateString();
    // Simple deterministic hash based on date string
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = today.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AFFIRMATIONS.length;
    return AFFIRMATIONS[index];
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: UI.spacing.xl,
        paddingTop: Platform.OS === 'ios' ? 18 : 8,
      }}
    >
      <ScreenHeader title={t('tabs.home')} subtitle={t('home.welcomeSubtitle')} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 26, marginTop: 14 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ gap: 14 }}>
            <SkeletonRect height={100} borderRadius={UI.radius.xl} />
            <SkeletonRect height={380} borderRadius={UI.radius.xl} />
            <SkeletonRect height={30} width={120} style={{ marginTop: 16 }} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <SkeletonRect height={120} borderRadius={UI.radius.xl} style={{ flex: 1 }} />
              <SkeletonRect height={120} borderRadius={UI.radius.xl} style={{ flex: 1 }} />
            </View>
          </View>
        ) : (
          <>
            {isExpired && (
              <Pressable
                onPress={() => router.push('/(auth)/trial-upgrade')}
                style={{
                  backgroundColor: '#a07b55',
                  borderRadius: UI.radius.lg,
                  padding: 16,
                  marginTop: 14,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>
                    {t('common.trialExpired')}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                    {t('common.upgradeToLifetime')}
                  </Text>
                </View>
                <Text style={{ color: 'white', fontSize: 24, fontWeight: '900', marginLeft: 10 }}>
                  →
                </Text>
              </Pressable>
            )}

            <View
              style={{
                backgroundColor: '#828a6a',
                borderRadius: UI.radius.xl,
                padding: 20,
                marginTop: 14,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 4,
              }}
            >
              <Text
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: '800',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                {t('common.dailyAffirmation')}
              </Text>
              <Text
                style={{
                  color: 'white',
                  fontSize: 20,
                  fontWeight: '700',
                  marginTop: 8,
                  fontStyle: 'italic',
                  lineHeight: 28,
                }}
              >
                {affirmation}
              </Text>
            </View>

            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: UI.radius.xl,
                padding: 16,
                marginTop: 14,
              }}
            >
              <MoodChart items={moodCheckIns} />
            </View>

            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: UI.radius.xl,
                padding: 16,
                marginTop: 14,
              }}
            >
              <Text style={{ fontWeight: '900', color: colors.mutedText, marginBottom: 4 }}>
                {t('common.wellnessSnapshot')}
              </Text>

              <ScoreCard
                score={wellness.score}
                title={t('common.mindMateWellnessScore')}
                subtitle={t('common.wellbeingBaseline')}
                bg="#6bbf8e"
              />
              <ScoreCard
                score={100 - wellness.breakdown.stress}
                title={t('common.stressLoad')}
                subtitle={t('common.keepStressManageable')}
                bg="#f2a65a"
              />
              <ScoreCard
                score={100 - wellness.breakdown.sleep}
                title={t('common.sleepQuality')}
                subtitle={t('common.prioritizeRest')}
                bg="#9b8df1"
              />

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <MiniStat label={t('common.moodCheckIns')} value={String(moodCount)} />
                <MiniStat label={t('common.journalEntries')} value={String(journalCount)} />
              </View>
            </View>

            <HorizontalActionList title={t('common.quickActions')} />

            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: UI.radius.lg,
                padding: 14,
                marginTop: 24,
              }}
            >
              <Text style={{ fontWeight: '900', color: colors.text }}>
                {t('common.needQuickReset')}
              </Text>
              <Text style={{ color: colors.mutedText, marginTop: 6 }}>
                {t('common.tapForBreathing')}
              </Text>
              <Pressable
                onPress={() => router.push('/(tabs)/stress')}
                style={{
                  marginTop: 12,
                  backgroundColor: colors.divider,
                  padding: 14,
                  borderRadius: UI.radius.lg,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontWeight: '900', color: colors.text }}>
                  {t('common.openStressToolkit')}
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
