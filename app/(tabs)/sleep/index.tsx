import React from 'react';
import { View, Text, Pressable, Platform, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenHeader from '@/components/ScreenHeader';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, UI } from '@/constants/theme';
import { showAlert } from '@/lib/state';
import { useSleepStore } from '@/store/useSleepStore';
import { MaterialIcons } from '@expo/vector-icons';
import { SkeletonRect } from '@/components/Skeleton';
import { getQualityLabel } from '@/lib/sleep-utils';
import { ActionCard } from '@/components/ActionCard';
import { GridItem } from '@/components/GridItem';
import { SummaryCard, SummaryRow } from '@/components/SummaryCard';

export default function SleepScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const {
    sleepMode,
    setSleepMode,
    sleepEntries: entries,
    fetchSleepEntries,
    isLoading: loading,
  } = useSleepStore();

  const { sleepModeStartISO } = sleepMode;

  React.useEffect(() => {
    (async () => {
      await fetchSleepEntries();
    })();
  }, [fetchSleepEntries]);

  const lastEntry = entries[0];

  const toggleSleepMode = () => {
    if (sleepModeStartISO) {
      const start = new Date(sleepModeStartISO);
      const end = new Date();
      const diffMs = end.getTime() - start.getTime();
      const diffHrs = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;

      showAlert(t('sleep.sleepModeEnded'), t('sleep.sleptFor', { count: diffHrs }), [
        {
          text: t('mood.no'),
          style: 'cancel',
          onPress: () => setSleepMode({ ...sleepMode, sleepModeStartISO: null }),
        },
        {
          text: t('sleep.logSleep'),
          onPress: () => {
            setSleepMode({ ...sleepMode, sleepModeStartISO: null });
            router.push({
              pathname: '/(tabs)/sleep/log',
              params: { duration: diffHrs.toString() },
            });
          },
        },
      ]);
    } else {
      setSleepMode({ ...sleepMode, sleepModeStartISO: new Date().toISOString() });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('tabs.sleep')} subtitle={t('sleep.hubSubtitle')} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={{ gap: 12 }}>
            <SkeletonRect height={160} borderRadius={UI.radius.xl} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <SkeletonRect height={120} borderRadius={UI.radius.xl} style={{ flex: 1 }} />
              <SkeletonRect height={120} borderRadius={UI.radius.xl} style={{ flex: 1 }} />
            </View>
            <SkeletonRect height={100} borderRadius={UI.radius.xl} />
            <SkeletonRect height={60} borderRadius={UI.radius.lg} />
          </View>
        ) : (
          <>
            <ActionCard
              title={t('sleep.sleepMode')}
              description={
                sleepModeStartISO
                  ? t('sleep.sleepModeStartedAt', {
                      time: new Date(sleepModeStartISO).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                    })
                  : t('sleep.sleepModeDescription')
              }
              icon="nightlight-round"
            >
              <View style={styles.autoDetectRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.autoDetectTitle, { color: colors.text }]}>
                    {t('sleep.automaticDetection')}
                  </Text>
                  <Text style={[styles.autoDetectSubtitle, { color: colors.mutedText }]}>
                    {t('sleep.detectWakeUp')}
                  </Text>
                </View>
                <Pressable
                  onPress={() =>
                    setSleepMode({ autoDetectionEnabled: !sleepMode.autoDetectionEnabled })
                  }
                  style={[
                    styles.toggle,
                    {
                      backgroundColor: sleepMode.autoDetectionEnabled
                        ? colors.primary
                        : colors.divider,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleCircle,
                      { transform: [{ translateX: sleepMode.autoDetectionEnabled ? 20 : 0 }] },
                    ]}
                  />
                </Pressable>
              </View>

              <Pressable
                onPress={toggleSleepMode}
                style={[
                  styles.modeButton,
                  { backgroundColor: sleepModeStartISO ? '#ff4b4b' : colors.primary },
                ]}
              >
                <Text style={styles.modeButtonText}>
                  {sleepModeStartISO ? t('sleep.stopSleepMode') : t('sleep.startSleepMode')}
                </Text>
              </Pressable>
            </ActionCard>

            <View style={styles.grid}>
              <GridItem
                title={t('sleep.logSleep')}
                icon="add-circle-outline"
                onPress={() => router.push('/(tabs)/sleep/log')}
              />
              <GridItem
                title={t('sleep.history')}
                icon="history"
                onPress={() => router.push('/(tabs)/sleep/history')}
              />
            </View>

            {lastEntry && (
              <SummaryCard
                title={t('sleep.lastNight')}
                icon="chevron-right"
                onPress={() => router.push(`/(tabs)/sleep/${lastEntry.id}`)}
                style={{ marginTop: 12 }}
              >
                <View style={styles.statsRow}>
                  <SummaryRow
                    label={t('sleep.duration')}
                    value={t('sleep.hours', { count: lastEntry.duration })}
                  />
                  <SummaryRow
                    label={t('sleep.quality')}
                    value={getQualityLabel(lastEntry.quality)}
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
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  modeButton: {
    padding: 16,
    borderRadius: UI.radius.lg,
    alignItems: 'center',
  },
  modeButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  autoDetectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  autoDetectTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  autoDetectSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  gridItem: {
    flex: 1,
    padding: 20,
    borderRadius: UI.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  gridLabel: {
    fontWeight: '900',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  mindfulLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: UI.radius.lg,
    marginTop: 12,
  },
});
