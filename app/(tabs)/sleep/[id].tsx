import React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenHeader from '@/components/ScreenHeader';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, UI } from '@/constants/theme';
import { sleepStore } from '@/store/sleepStore';
import { MaterialIcons } from '@expo/vector-icons';
import { showAlert } from '@/lib/state';

export default function SleepDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const { sleepEntries, deleteSleepEntry } = sleepStore();

  const entry = sleepEntries.find((e) => e.id === id);

  const handleDelete = () => {
    showAlert('Delete Entry', 'Are you sure you want to delete this sleep entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteSleepEntry(id as string);
          router.back();
        },
      },
    ]);
  };

  if (!entry) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title="Sleep Detail" />
        <View style={styles.center}>
          <Text style={{ color: colors.text }}>Entry not found.</Text>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={{ color: colors.primary }}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const startDate = new Date(entry.start_iso ?? '');
  const endDate = new Date(entry.end_iso ?? '');

  const durationHrs = Math.max(
    0,
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60),
  ).toFixed(1);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Sleep Detail"
        subtitle={startDate.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        showBack
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <MaterialIcons name="access-time" size={24} color={colors.primary} />
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>Duration</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{durationHrs} hrs</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons
                name={getQualityIcon(entry.quality || 3)}
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>Quality</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {getQualityLabel(entry.quality || 3)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.timeRow}>
            <View>
              <Text style={[styles.timeLabel, { color: colors.mutedText }]}>Bedtime</Text>
              <Text style={[styles.timeValue, { color: colors.text }]}>
                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <MaterialIcons name="arrow-forward" size={20} color={colors.border} />
            <View>
              <Text style={[styles.timeLabel, { color: colors.mutedText, textAlign: 'right' }]}>
                Wake up
              </Text>
              <Text style={[styles.timeValue, { color: colors.text, textAlign: 'right' }]}>
                {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>

          {entry.awakenings !== undefined && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.mutedText }]}>Awakenings</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{entry.awakenings}</Text>
              </View>
            </>
          )}

          {entry.notes && (
            <>
              <View style={styles.divider} />
              <View style={styles.notesSection}>
                <Text style={[styles.infoLabel, { color: colors.mutedText, marginBottom: 8 }]}>
                  Notes
                </Text>
                <Text style={[styles.notesText, { color: colors.text }]}>{entry.notes}</Text>
              </View>
            </>
          )}

          <Pressable
            onPress={handleDelete}
            style={[styles.deleteButton, { borderColor: '#ff4b4b' }]}
          >
            <MaterialIcons name="delete-outline" size={20} color="#ff4b4b" />
            <Text style={styles.deleteButtonText}>Delete Entry</Text>
          </Pressable>
        </View>
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
  card: {
    padding: 24,
    borderRadius: UI.radius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  notesSection: {},
  notesText: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: UI.radius.md,
  },
  deleteButtonText: {
    color: '#ff4b4b',
    fontWeight: '700',
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    padding: 12,
  },
});
