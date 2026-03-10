import { MoodLog } from '@/types/alias';

/**
 * Calculates the current consecutive days streak of mood check-ins.
 * It counts backward from today (or the latest log if it was today/yesterday).
 */
export function calculateStreak(logs: MoodLog[]): number {
  if (logs.length === 0) return 0;

  // Sort logs by date descending
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime(),
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastLogDate = new Date(sortedLogs[0].logged_at);
  lastLogDate.setHours(0, 0, 0, 0);

  // If the last log is older than yesterday, the streak is broken
  if (lastLogDate.getTime() < yesterday.getTime()) {
    return 0;
  }

  let streak = 0;
  let currentDate = lastLogDate;

  // We use a Set of ISO date strings (YYYY-MM-DD) for easy lookup
  const loggedDates = new Set(
    sortedLogs.map((log) => new Date(log.logged_at).toISOString().split('T')[0]),
  );

  while (loggedDates.has(currentDate.toISOString().split('T')[0])) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

/**
 * Calculates the mood trend over a set of logs using linear regression slope.
 * Returns the average change per day (slope) and a qualitative description.
 */
export function calculateMoodTrend(logs: MoodLog[]): {
  trend: 'improving' | 'declining' | 'stable';
  change: number;
} {
  if (logs.length < 2) {
    return { trend: 'stable', change: 0 };
  }

  // Sort logs by date ascending for trend analysis
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime(),
  );

  const values = sortedLogs.map((l) => l.mood_score);
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((s, v) => s + v, 0) / n;
  const num = values.reduce((sum, y, x) => sum + (x - xMean) * (y - yMean), 0);
  const denom = values.reduce((sum, _, x) => sum + Math.pow(x - xMean, 2), 0);
  const slope = denom === 0 ? 0 : num / denom;

  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (slope > 0.1) trend = 'improving';
  else if (slope < -0.1) trend = 'declining';

  return { trend, change: slope };
}

/**
 * Detects if there has been a significant decline in mood recently.
 * Compares the average of the most recent 3 logs to the average of the previous 7 logs.
 */
export function detectMoodDecline(logs: MoodLog[]): {
  declined: boolean;
  severity: number;
  message?: string;
} {
  if (logs.length < 5) {
    return { declined: false, severity: 0 };
  }

  // Sort logs by date descending
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime(),
  );

  const recentLogs = sortedLogs.slice(0, 3);
  const previousLogs = sortedLogs.slice(3, 10);

  const recentAvg = recentLogs.reduce((sum, log) => sum + log.mood_score, 0) / recentLogs.length;
  const previousAvg =
    previousLogs.reduce((sum, log) => sum + log.mood_score, 0) / previousLogs.length;

  const decline = previousAvg - recentAvg;

  if (decline > 1.5) {
    return {
      declined: true,
      severity: decline,
      message: 'Significant mood decline detected over the last few days.',
    };
  }

  return { declined: false, severity: decline > 0 ? decline : 0 };
}
