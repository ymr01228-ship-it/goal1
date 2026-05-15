// Behavior analysis engine for FocusOS
// Analyzes user patterns to generate insights

import type { DailyMomentum } from '@/types/gamification.types';

export interface BehaviorInsight {
  type: 'strength' | 'weakness' | 'pattern' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
}

export function analyzeBehavior(
  momentum: DailyMomentum[],
  habitCompletionRate: number,
  detoxScore: number,
  journalStreak: number,
  blockAttempts: number
): BehaviorInsight[] {
  const insights: BehaviorInsight[] = [];

  // Habit analysis
  if (habitCompletionRate >= 80) {
    insights.push({
      type: 'strength',
      title: 'Strong Habit Consistency',
      description: `You're completing ${habitCompletionRate}% of your habits. This level of consistency builds lasting change.`,
      confidence: 0.9,
    });
  } else if (habitCompletionRate < 50) {
    insights.push({
      type: 'weakness',
      title: 'Habit Compliance Needs Attention',
      description: `At ${habitCompletionRate}%, you're missing too many habits. Focus on completing critical habits first.`,
      confidence: 0.85,
    });
  }

  // Detox analysis
  if (detoxScore >= 80) {
    insights.push({
      type: 'strength',
      title: 'Excellent Digital Discipline',
      description: 'Your detox score shows strong resistance to digital distractions. Keep it up!',
      confidence: 0.9,
    });
  } else if (detoxScore < 50) {
    insights.push({
      type: 'weakness',
      title: 'Digital Distraction Risk',
      description: 'Your detox score indicates frequent engagement with distracting content. Consider activating War Mode more often.',
      confidence: 0.85,
    });
  }

  // Journal analysis
  if (journalStreak >= 7) {
    insights.push({
      type: 'strength',
      title: 'Consistent Self-Reflection',
      description: `${journalStreak} days of journaling! Self-awareness is the foundation of lasting change.`,
      confidence: 0.95,
    });
  }

  // Block attempts analysis
  if (blockAttempts > 5) {
    insights.push({
      type: 'pattern',
      title: 'Frequent Distraction Impulses',
      description: `You've had ${blockAttempts} blocked site attempts. This suggests underlying stress or boredom. Try a breathing exercise when the urge hits.`,
      confidence: 0.8,
    });
  }

  // Momentum trend
  const recentMomentum = momentum.slice(-7);
  if (recentMomentum.length >= 3) {
    const avgScore = recentMomentum.reduce((sum, m) => sum + m.score, 0) / recentMomentum.length;
    const trend = recentMomentum.length > 1
      ? recentMomentum[recentMomentum.length - 1].score - recentMomentum[0].score
      : 0;

    if (trend > 10) {
      insights.push({
        type: 'pattern',
        title: 'Upward Momentum',
        description: 'Your performance is trending upward. This is the momentum that changes lives. Don\'t stop now.',
        confidence: 0.85,
      });
    } else if (trend < -10) {
      insights.push({
        type: 'recommendation',
        title: 'Momentum Declining',
        description: `Average score: ${Math.round(avgScore)}. Consider scheduling a War Mode session to reset your focus.`,
        confidence: 0.8,
      });
    }
  }

  return insights;
}

export function generateWeeklyVerdict(
  habitCompliance: number,
  studyHours: number,
  blockAttempts: number,
  detoxAvg: number,
  pomodorosCompleted: number
): {
  percentage: number;
  verdict: string;
  improvements: string[];
} {
  // Calculate overall performance percentage
  const habitScore = Math.min(habitCompliance, 100);
  const studyScore = Math.min((studyHours / 10) * 100, 100); // 10 hours = 100%
  const detoxScoreCalc = detoxAvg;
  const pomodoroScore = Math.min((pomodorosCompleted / 14) * 100, 100); // 14 pomodoros/week = 100%
  const blockPenalty = Math.min(blockAttempts * 2, 30);

  const percentage = Math.max(
    0,
    Math.round((habitScore * 0.3 + studyScore * 0.25 + detoxScoreCalc * 0.25 + pomodoroScore * 0.2) - blockPenalty)
  );

  let verdict: string;
  if (percentage >= 90) verdict = 'Outstanding. You are becoming the person you committed to be.';
  else if (percentage >= 75) verdict = 'Good performance. There\'s room for improvement, but you\'re on the right track.';
  else if (percentage >= 50) verdict = 'Mediocre. You can do better, and you know it. Time to step up.';
  else verdict = 'Below expectations. This week did not serve your goal. Let\'s fix this together.';

  const improvements: string[] = [];
  if (habitCompliance < 80) improvements.push('Complete at least 80% of your daily habits this week');
  if (studyHours < 5) improvements.push('Study at least 5 hours this week toward your courses');
  if (blockAttempts > 10) improvements.push('Reduce distraction attempts — use breathing exercises instead');
  if (pomodorosCompleted < 7) improvements.push('Complete at least 1 Pomodoro session per day');
  if (improvements.length === 0) improvements.push('Maintain your current excellent performance');

  return { percentage, verdict, improvements };
}
