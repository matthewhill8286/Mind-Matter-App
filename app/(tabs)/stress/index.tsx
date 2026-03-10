import React, { useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Platform, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenHeader from '@/components/ScreenHeader';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/useSubscription';
import { Colors, UI } from '@/constants/theme';
import { stressStore } from '@/store/stressStore';
import { stressHistoryStore } from '@/store/stressHistoryStore';
import { showAlert } from '@/lib/state';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SkeletonRect } from '@/components/Skeleton';
import { GridCard } from '@/components/GridCard';
import { HorizontalVideoList } from '@/components/HorizontalVideoList';
import { STRESS_VIDEOS } from '@/data/stressVideos';
import { ActionCard } from '@/components/ActionCard';
import { SummaryCard, SummaryRow } from '@/components/SummaryCard';

export default function StressHub() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const { hasFullAccess } = useSubscription();
  const colors = Colors[theme];

  const { stressKit: kit, fetchStressKit, isLoading: kitLoading } = stressStore();
  const { stressHistory, fetchStressHistory, isLoading: historyLoading } = stressHistoryStore();

  const loading = kitLoading || historyLoading;

  useEffect(() => {
    (async () => {
      await fetchStressKit();
      await fetchStressHistory();
    })();
  }, [fetchStressKit, fetchStressHistory]);

  const lastExercise = stressHistory[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('tabs.stress')} subtitle={t('stress.hubSubtitle')} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ gap: 12 }}>
            <SkeletonRect height={160} borderRadius={UI.radius.xl} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <SkeletonRect height={120} borderRadius={UI.radius.xl} style={{ flex: 1 }} />
              <SkeletonRect height={120} borderRadius={UI.radius.xl} style={{ flex: 1 }} />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <SkeletonRect height={120} borderRadius={UI.radius.xl} style={{ flex: 1 }} />
              <SkeletonRect height={120} borderRadius={UI.radius.xl} style={{ flex: 1 }} />
            </View>
            <SkeletonRect height={100} borderRadius={UI.radius.xl} style={{ marginTop: 6 }} />
          </View>
        ) : (
          <>
            <ActionCard
              title={
                kit &&
                (kit.triggers.length > 0 || kit.helpful_actions.length > 0 || kit.people.length > 0)
                  ? t('stress.yourStressKit')
                  : t('stress.quick_phrase')
              }
              icon="psychology"
            >
              {kit &&
              (kit?.triggers.length > 0 ||
                kit?.helpful_actions.length > 0 ||
                kit?.people.length > 0) ? (
                <View style={{ gap: 12, marginBottom: 20 }}>
                  <Text
                    style={[
                      styles.cardDescription,
                      { color: colors.mutedText, fontStyle: 'italic', marginBottom: 0 },
                    ]}
                  >
                    &quot;{kit?.quick_phrase || t('stress.defaultQuickPhrase')}&quot;
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {kit.helpful_actions.slice(0, 3).map((action, idx) => (
                      <View
                        key={idx}
                        style={{
                          backgroundColor: colors.primary + '15',
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: UI.radius.sm,
                        }}
                      >
                        <Text
                          style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}
                          numberOfLines={1}
                        >
                          {action}
                        </Text>
                      </View>
                    ))}
                    {kit.helpful_actions.length > 3 && (
                      <Text style={{ color: colors.mutedText, fontSize: 12 }}>
                        {t('common.more', { count: kit.helpful_actions.length - 3 })}
                      </Text>
                    )}
                  </View>
                </View>
              ) : (
                <Text
                  style={[styles.cardDescription, { color: colors.mutedText, fontStyle: 'italic' }]}
                >
                  &quot;{kit?.quick_phrase || t('stress.defaultQuickPhrase')}&quot;
                </Text>
              )}

              <Pressable
                onPress={() => {
                  if (!hasFullAccess) {
                    showAlert(t('common.premiumFeature'), t('stress.upgradeToUnlockPlan'), [
                      { text: t('common.cancel'), style: 'cancel' },
                      {
                        text: t('common.upgrade'),
                        onPress: () => router.push('/(auth)/trial-upgrade'),
                      },
                    ]);
                    return;
                  }
                  router.push('/(tabs)/stress/plan');
                }}
                style={[
                  styles.modeButton,
                  { backgroundColor: colors.primary, opacity: hasFullAccess ? 1 : 0.7 },
                ]}
              >
                <Text style={styles.modeButtonText}>
                  {kit &&
                  (kit.triggers.length > 0 ||
                    kit.helpful_actions.length > 0 ||
                    kit.people.length > 0)
                    ? t('stress.viewFullPlan')
                    : t('stress.manageStressPlan')}
                </Text>
              </Pressable>
            </ActionCard>

            <View style={styles.grid}>
              <GridCard
                title={t('stress.grounding')}
                icon="touch-app"
                color="#f2a65a"
                onPress={() => {
                  if (!hasFullAccess) {
                    showAlert(t('common.premiumFeature'), t('stress.upgradeToUnlockGrounding'), [
                      { text: t('common.cancel'), style: 'cancel' },
                      {
                        text: t('common.upgrade'),
                        onPress: () => router.push('/(auth)/trial-upgrade'),
                      },
                    ]);
                    return;
                  }
                  router.push('/(tabs)/stress/grounding');
                }}
                isLocked={!hasFullAccess}
              />
              <GridCard
                title={t('stress.breathing')}
                icon="air"
                color="#4fc3f7"
                onPress={() => router.push('/(tabs)/stress/breathing')}
              />
              <GridCard
                title={t('stress.relatableVideo')}
                icon="video-library"
                color="#e57373"
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/stress/list/[category]/[videoId]',
                    params: { category: 'body', videoId: 'yt-1' },
                  })
                }
              />
              <GridCard
                title={t('stress.watchLatest')}
                icon="play-circle-outline"
                color="#a07b55"
                onPress={() => {
                  if (lastExercise) {
                    const video = STRESS_VIDEOS.find((v) => v.id === lastExercise.id);
                    router.push({
                      pathname: '/(tabs)/stress/list/[category]/[videoId]',
                      params: {
                        category: video?.category || 'body',
                        videoId: lastExercise.id,
                      },
                    });
                  } else {
                    router.push({
                      pathname: '/(tabs)/stress/list/[category]/[videoId]',
                      params: { category: 'body', videoId: 'body-1' },
                    });
                  }
                }}
              />
            </View>

            <HorizontalVideoList
              title={t('stress.bodyRelaxation')}
              category="body"
              icon="fitness-center"
              iconColor="#6bbf8e"
            />

            <HorizontalVideoList
              title={t('stress.mindRelaxation')}
              category="mind"
              icon="self-improvement"
              iconColor="#9b8df1"
            />

            {lastExercise && (
              <SummaryCard
                title={t('stress.recentActivity')}
                icon="history"
                onPress={() => {
                  const video = STRESS_VIDEOS.find((v) => v.id === lastExercise.id);
                  router.push({
                    pathname: '/(tabs)/stress/list/[category]/[videoId]',
                    params: {
                      category: video?.category || 'body',
                      videoId: lastExercise.id,
                    },
                  });
                }}
                style={{ marginTop: 12 }}
              >
                <View style={styles.statsRow}>
                  <SummaryRow label={t('stress.lastExercise')} value={lastExercise.title} />
                  <SummaryRow
                    label={t('common.date')}
                    value={new Date(lastExercise.date).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                    align="end"
                  />
                </View>
              </SummaryCard>
            )}

            <Pressable
              onPress={() => router.push('/(tabs)/mindful-hours')}
              style={[styles.mindfulLink, { backgroundColor: colors.card }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <MaterialIcons name="self-improvement" size={24} color="#6bbf8e" />
                <Text style={{ fontWeight: '900', color: colors.text }}>
                  {t('stress.viewMindfulHours')}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.mutedText} />
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: UI.spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 18 : 8,
  },
  scrollContent: {
    paddingBottom: 40,
    marginTop: 14,
    gap: 12,
  },
  card: {
    padding: 20,
    borderRadius: UI.radius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  cardDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  modeButton: {
    paddingVertical: 14,
    borderRadius: UI.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: UI.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  gridLabel: {
    fontWeight: '800',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  mindfulLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: UI.radius.xl,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
});
