import React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenHeader from '@/components/ScreenHeader';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, UI } from '@/constants/theme';
import { useMoodStore } from '@/store/useMoodStore';
import { MaterialIcons } from '@expo/vector-icons';
import { showAlert } from '@/lib/state';

export default function MoodDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const { moodCheckIns, deleteMoodCheckIn } = useMoodStore();

  const entry = moodCheckIns.find((e) => e.id === id);

  const handleDelete = () => {
    showAlert('Delete Entry', 'Are you sure you want to delete this mood check-in?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteMoodCheckIn(id as string);
          router.back();
        },
      },
    ]);
  };

  if (!entry) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title="Mood Detail" />
        <View style={styles.center}>
          <Text style={{ color: colors.text }}>Entry not found.</Text>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={{ color: colors.primary }}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const date = new Date(entry.created_at);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Mood Detail"
        subtitle={date.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        showBack
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.moodHeader}>
            <MaterialIcons name={getMoodIcon(entry.mood)} size={48} color={colors.primary} />
            <Text style={[styles.moodText, { color: colors.text }]}>{entry.mood}</Text>
            <Text style={[styles.timeText, { color: colors.mutedText }]}>
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>Energy</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{entry.energy}/5</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>Stress</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{entry.stress}/10</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>Sleep</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {entry.sleep_hours || 0}h
              </Text>
            </View>
          </View>

          {entry.tags && entry.tags.length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.tagsSection}>
                <Text style={[styles.infoLabel, { color: colors.mutedText, marginBottom: 8 }]}>
                  Tags
                </Text>
                <View style={styles.tagsContainer}>
                  {entry.tags.map((tag, idx) => (
                    <View key={idx} style={[styles.tag, { backgroundColor: colors.background }]}>
                      <Text style={[styles.tagText, { color: colors.primary }]}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          {entry.note && (
            <>
              <View style={styles.divider} />
              <View style={styles.notesSection}>
                <Text style={[styles.infoLabel, { color: colors.mutedText, marginBottom: 8 }]}>
                  Notes
                </Text>
                <Text style={[styles.notesText, { color: colors.text }]}>{entry.note}</Text>
              </View>
            </>
          )}

          <Pressable
            onPress={handleDelete}
            style={[styles.deleteButton, { borderColor: '#ff4b4b' }]}
          >
            <MaterialIcons name="delete-outline" size={20} color="#ff4b4b" />
            <Text style={styles.deleteButtonText}>Delete Check-In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function getMoodIcon(mood: string) {
  switch (mood) {
    case 'Great':
      return 'sentiment-very-satisfied';
    case 'Good':
      return 'sentiment-satisfied';
    case 'Okay':
      return 'sentiment-neutral';
    case 'Low':
      return 'sentiment-dissatisfied';
    case 'Bad':
      return 'sentiment-very-dissatisfied';
    default:
      return 'sentiment-neutral';
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
  moodHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  moodText: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 8,
  },
  timeText: {
    fontSize: 16,
    marginTop: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
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
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  tagsSection: {},
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: UI.radius.sm,
  },
  tagText: {
    fontSize: 13,
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
