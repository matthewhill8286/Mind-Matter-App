import React from 'react';
import { View, Text, Pressable, Platform, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenHeader from '@/components/ScreenHeader';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, UI } from '@/constants/theme';
import { useJournalStore } from '@/store/useJournalStore';
import { SkeletonRect } from '@/components/Skeleton';
import { ActionCard } from '@/components/ActionCard';
import { GridItem } from '@/components/GridItem';
import { SummaryCard, SummaryRow } from '@/components/SummaryCard';

export default function JournalHub() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const { journalEntries: entries, fetchJournalEntries, isLoading: loading } = useJournalStore();

  React.useEffect(() => {
    (async () => {
      await fetchJournalEntries();
    })();
  }, [fetchJournalEntries]);

  const lastEntry = entries[0];

  const subHeader =
    entries.length > 0
      ? t('journal.entriesCount', { count: entries.length })
      : t('journal.hubSubtitle');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('tabs.journal')} subtitle={subHeader} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ gap: 12 }}>
            <SkeletonRect height={160} borderRadius={UI.radius.xl} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <SkeletonRect height={120} borderRadius={UI.radius.xl} style={{ flex: 1 }} />
              <SkeletonRect height={120} borderRadius={UI.radius.xl} style={{ flex: 1 }} />
            </View>
            <SkeletonRect height={100} borderRadius={UI.radius.xl} />
          </View>
        ) : (
          <>
            <ActionCard
              title={t('journal.newEntry')}
              description={t('journal.newEntryDescription')}
              icon="edit-note"
            >
              <Pressable
                onPress={() => router.push('/(tabs)/journal/new')}
                style={[styles.modeButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.modeButtonText}>{t('journal.writeReflection')}</Text>
              </Pressable>
            </ActionCard>

            <View style={styles.grid}>
              <GridItem
                title={t('journal.prompts')}
                icon="lightbulb-outline"
                onPress={() => router.push('/(tabs)/journal/prompts')}
              />
              <GridItem
                title={t('journal.history')}
                icon="history"
                onPress={() => router.push('/(tabs)/journal/history')}
              />
            </View>

            {lastEntry && (
              <SummaryCard
                title={t('journal.lastEntry')}
                icon="chevron-right"
                onPress={() => router.push(`/(tabs)/journal/${lastEntry.id}`)}
                style={{ marginTop: 12 }}
              >
                <View style={styles.statsRow}>
                  <SummaryRow
                    label={t('journal.title')}
                    value={lastEntry.title || t('common.untitled')}
                  />
                  <SummaryRow
                    label={t('journal.mood')}
                    value={lastEntry.mood || t('common.notApplicable')}
                    align="end"
                  />
                </View>
              </SummaryCard>
            )}
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
    gap: 8,
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
    paddingVertical: 14,
    borderRadius: UI.radius.lg,
    alignItems: 'center',
  },
  modeButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
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
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  gridLabel: {
    fontSize: 14,
    fontWeight: '800',
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
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
});
