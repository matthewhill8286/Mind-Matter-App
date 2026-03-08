import React from 'react';
import { View, Text, Pressable, ScrollView, Platform, StyleSheet } from 'react-native';
import ScreenHeader from '@/components/ScreenHeader';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, UI } from '@/constants/theme';
import { useSleepStore } from '@/store/useSleepStore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function SleepHistoryScreen() {
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  const { sleepEntries: entries, fetchSleepEntries, isLoading: loading } = useSleepStore();

  React.useEffect(() => {
    fetchSleepEntries();
  }, [fetchSleepEntries]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Sleep History" subtitle="Review your past rest." />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <Text style={{ color: colors.mutedText, textAlign: 'center', marginTop: 20 }}>
            Loading...
          </Text>
        ) : entries.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="hotel" size={64} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.mutedText }]}>
              No sleep entries yet.
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)/sleep/log')}
              style={[styles.button, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.buttonText}>Log Sleep</Text>
            </Pressable>
          </View>
        ) : (
          entries.map((entry: any) => (
            <Pressable
              key={entry.id}
              onPress={() => router.push(`/(tabs)/sleep/${entry.id}`)}
              style={[styles.entryCard, { backgroundColor: colors.card }]}
            >
              <View style={styles.entryHeader}>
                <Text style={[styles.entryDate, { color: colors.text }]}>
                  {new Date(entry.startISO).toLocaleString()}
                </Text>
                <View style={styles.qualityBadge}>
                  <MaterialIcons
                    name={getQualityIcon(entry.quality)}
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={[styles.qualityText, { color: colors.primary }]}>
                    {getQualityLabel(entry.quality)}
                  </Text>
                </View>
              </View>
              <Text style={[styles.entryDuration, { color: colors.mutedText }]}>
                {Math.max(
                  0,
                  (new Date(entry.endISO).getTime() - new Date(entry.startISO).getTime()) /
                    (1000 * 60 * 60),
                ).toFixed(1)}{' '}
                hours of sleep
              </Text>
              {entry.notes && (
                <Text style={[styles.entryNote, { color: colors.text }]} numberOfLines={2}>
                  {entry.notes}
                </Text>
              )}
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function getQualityIcon(val: number) {
  switch (val) {
    case 1:
      return 'sentiment-very-dissatisfied';
    case 2:
      return 'sentiment-dissatisfied';
    case 3:
      return 'sentiment-neutral';
    case 4:
      return 'sentiment-satisfied';
    case 5:
      return 'sentiment-very-satisfied';
    default:
      return 'sentiment-neutral';
  }
}

function getQualityLabel(val: number) {
  switch (val) {
    case 1:
      return 'Poor';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Great';
    case 5:
      return 'Excellent';
    default:
      return '';
  }
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
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: UI.radius.md,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '900',
  },
  entryCard: {
    padding: 16,
    borderRadius: UI.radius.lg,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDate: {
    fontWeight: '900',
    fontSize: 16,
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qualityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  entryDuration: {
    fontSize: 14,
    marginBottom: 8,
  },
  entryNote: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
