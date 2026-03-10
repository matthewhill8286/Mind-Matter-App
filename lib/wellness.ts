import { MoodLog } from '@/types/alias';
import { calculateMoodTrend, calculateStreak, detectMoodDecline } from './mood-analysis';

export function calculateWellnessScore(data: any) {
  if (!data) {
    return {
      score: 0,
      breakdown: { mood: 0, sleep: 0, stress: 0, mindfulness: 0, consistency: 0 },
      streak: 0,
      trend: 'stable',
      decline: false,
    };
  }
  const moodCheckIns: MoodLog[] = data.moodCheckIns || [];
  const journalEntries = data.journalEntries || [];
  const mindfulnessHistory = data.mindfulnessHistory || [];
  const sleepEntries = data.sleepEntries || [];

  const streak = calculateStreak(moodCheckIns);
  const { trend } = calculateMoodTrend(moodCheckIns);
  const { declined } = detectMoodDecline(moodCheckIns);

  const moodScore = moodCheckIns.length > 0 ? 85 : 0;
  const sleepScore = sleepEntries.length > 0 ? 75 : 0;
  const stressScore = 40;
  const mindfulnessScore = mindfulnessHistory.length > 0 ? 90 : 0;
  const consistencyScore = (moodCheckIns.length + journalEntries.length) * 10;

  console.log('scores', {
    mood: moodScore,
    sleep: sleepScore,
    stress: stressScore,
    mindfulness: mindfulnessScore,
    consistency: consistencyScore,
    streak,
    trend,
    declined,
  });

  const total = Math.min(
    100,
    Math.round((moodScore + sleepScore + stressScore + mindfulnessScore + consistencyScore) / 5),
  );

  return {
    score: total,
    breakdown: {
      mood: moodScore,
      sleep: sleepScore,
      stress: stressScore,
      mindfulness: mindfulnessScore,
      consistency: consistencyScore,
    },
    streak,
    trend,
    decline: declined,
  };
}
