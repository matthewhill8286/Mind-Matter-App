import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, Platform } from 'react-native';
import ScreenHeader from '@/components/ScreenHeader';
import Calendar from '@/components/Calendar';
import { moodStore } from '@/store/moodStore';
import { MoodCheckIn } from '@/lib/types';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, UI } from '@/constants/theme';
import { SkeletonRect } from '@/components/Skeleton';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

function getMoodIcon(mood: MoodCheckIn['mood']) {
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

export default function MoodHistory() {
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  const { moodCheckIns: items, fetchMoodCheckIns } = moodStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMoodCheckIns().finally(() => setLoading(false));
  }, [fetchMoodCheckIns]);

  const markedDates = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.created_at.split('T')[0])));
  }, [items]);

  const filteredItems = useMemo(() => {
    const iso = selectedDate.toISOString().split('T')[0];
    return items.filter((i) => i.created_at.split('T')[0] === iso);
  }, [items, selectedDate]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: UI.spacing.xl,
        paddingTop: Platform.OS === 'ios' ? 18 : 8,
      }}
    >
      <ScreenHeader title="Mood History" showBack />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24, marginTop: 14 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginTop: 20, gap: 12 }}>
          {loading ? (
            <>
              <SkeletonRect height={300} borderRadius={UI.radius.lg} />
              <SkeletonRect height={200} borderRadius={UI.radius.lg} style={{ marginTop: 8 }} />
            </>
          ) : (
            <>
              <Calendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                markedDates={markedDates}
              />

              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: UI.radius.lg,
                  padding: 14,
                  marginTop: 8,
                }}
              >
                <Text style={{ fontWeight: '900', color: colors.text }}>
                  {selectedDate.toLocaleDateString() === new Date().toLocaleDateString()
                    ? 'Recent check-ins'
                    : `Check-ins for ${selectedDate.toLocaleDateString()}`}
                </Text>
                <Text style={{ color: colors.mutedText, marginTop: 6 }}>
                  {filteredItems.length === 0
                    ? 'No entries for this day.'
                    : 'Tap an entry for details.'}
                </Text>

                {filteredItems.length > 0 && (
                  <View style={{ marginTop: 10 }}>
                    {filteredItems.map((item) => (
                      <Pressable
                        key={item.id}
                        onPress={() => router.push(`/(tabs)/mood/${item.id}`)}
                        style={{
                          padding: 12,
                          borderRadius: UI.radius.md,
                          backgroundColor: colors.background,
                          marginBottom: 10,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            gap: 10,
                            alignItems: 'center',
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <MaterialIcons
                              name={getMoodIcon(item.mood)}
                              size={20}
                              color={colors.primary}
                            />
                            <Text style={{ fontWeight: '900', color: colors.text }}>
                              {item.mood}
                            </Text>
                          </View>
                          <Text style={{ color: colors.mutedText }}>
                            {new Date(item.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                        <Text style={{ color: colors.mutedText, marginTop: 6 }}>
                          Energy {item.energy}/5 • Stress {item.stress}/10
                        </Text>
                        {item.note ? (
                          <Text style={{ color: colors.mutedText, marginTop: 6 }} numberOfLines={2}>
                            {item.note}
                          </Text>
                        ) : null}
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
