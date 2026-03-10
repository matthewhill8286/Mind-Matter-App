import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useMoodStore } from '@/store/useMoodStore';
import { useJournalStore } from '@/store/useJournalStore';
import { useSleepStore } from '@/store/useSleepStore';
import { useMindfulnessStore } from '@/store/useMindfulnessStore';
import { useStressHistoryStore } from '@/store/useStressHistoryStore';
import { useProfileStore } from '@/store/useProfileStore';
import ScoreCard from '@/components/ScoreCard';
import { SkeletonRect } from '@/components/Skeleton';
import { UI } from '@/constants/theme';
import { calculateWellnessScore } from '@/lib/wellness';

export default function ProfileCompletion() {
  const [loading, setLoading] = useState(true);
  const { profile, assessment, fetchProfile, fetchAssessment } = useProfileStore();
  const { moodCheckIns, fetchMoodCheckIns } = useMoodStore();
  const { journalEntries, fetchJournalEntries } = useJournalStore();
  const { sleepEntries, fetchSleepEntries } = useSleepStore();
  const { mindfulnessHistory, fetchMindfulnessHistory } = useMindfulnessStore();
  const { stressHistory, fetchStressHistory } = useStressHistoryStore();

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

  const wellness = calculateWellnessScore(allData);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([
        fetchProfile(),
        fetchAssessment(),
        fetchMoodCheckIns(),
        fetchJournalEntries(),
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
    fetchProfile,
    fetchSleepEntries,
    fetchStressHistory,
  ]);

  const name = profile?.name;

  return (
    <View style={{ flex: 1, backgroundColor: '#6f6660', padding: 24, paddingTop: 60 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
          gap: 12,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.1)',
          }}
        >
          <Text style={{ color: 'white', fontSize: 24 }}>←</Text>
        </Pressable>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>Completion</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={{ backgroundColor: 'white', borderRadius: 32, padding: 26, minHeight: 400 }}>
          {loading ? (
            <View style={{ gap: 14 }}>
              <SkeletonRect height={30} width={180} />
              <SkeletonRect height={20} width={240} />
              <View style={{ marginTop: 20, gap: 12 }}>
                <SkeletonRect height={100} borderRadius={UI.radius.xl} />
                <SkeletonRect height={100} borderRadius={UI.radius.xl} />
                <SkeletonRect height={100} borderRadius={UI.radius.xl} />
              </View>
            </View>
          ) : (
            <>
              <Text style={{ fontSize: 26, fontWeight: '900', color: '#6a5e55' }}>
                {name ? `Nice to meet you, ${name}` : 'Profile complete'}
              </Text>
              <Text style={{ opacity: 0.7, marginTop: 8, color: '#6a5e55', fontSize: 16 }}>
                Here’s a snapshot from your check-in.
              </Text>

              <View style={{ marginTop: 10 }}>
                <ScoreCard
                  score={wellness.score}
                  title="MindMatters Wellness Score"
                  subtitle="A gentle baseline of wellbeing today."
                  bg="#6bbf8e"
                />
                <ScoreCard
                  score={100 - wellness.breakdown.stress}
                  title="Stress Load"
                  subtitle="A moderate stress signal—let’s keep it manageable."
                  bg="#f2a65a"
                />
                <ScoreCard
                  score={100 - wellness.breakdown.sleep}
                  title="Sleep Quality"
                  subtitle="Low energy risk detected—prioritize rest when possible."
                  bg="#9b8df1"
                />
              </View>
            </>
          )}
        </View>

        <View style={{ marginTop: 30 }}>
          <Pressable
            onPress={() => router.replace('/(onboarding)/suggested-categories')}
            style={{
              paddingVertical: 20,
              borderRadius: 35,
              backgroundColor: '#a07b55',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 18 }}>Continue</Text>
            <Text style={{ color: 'white', fontSize: 20 }}>→</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
