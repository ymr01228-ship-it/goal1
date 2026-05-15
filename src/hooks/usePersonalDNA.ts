import { useMemo } from 'react';
import { usePersonalDNAStore } from '@/stores/usePersonalDNAStore';
import { useHabitsStore } from '@/stores/useHabitsStore';
import { useGamificationStore } from '@/stores/useGamificationStore';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function usePersonalDNA() {
  const dnaStore = usePersonalDNAStore();
  const habitsStore = useHabitsStore();
  const { momentum, detoxHistory } = useGamificationStore();

  const insights = useMemo(() => {
    const results: string[] = [];

    // Peak hours insight
    if (dnaStore.peakHours.length > 0) {
      const peakStr = dnaStore.peakHours.map((h) => `${h}:00`).join(', ');
      results.push(`Your peak focus hours are ${peakStr}. Schedule important work during these times.`);
    }

    // Weakest days insight
    if (dnaStore.weakestDays.length > 0) {
      const weakStr = dnaStore.weakestDays.map((d) => DAY_NAMES[d]).join(' and ');
      results.push(`${weakStr} tend to be your weakest days. Plan extra accountability measures.`);
    }

    // Habit correlation
    const todayHabits = habitsStore.getTodayHabits();
    const completedHabits = todayHabits.filter((h) => habitsStore.isCompletedToday(h.id));
    if (completedHabits.length > 0 && todayHabits.length > 0) {
      const rate = Math.round((completedHabits.length / todayHabits.length) * 100);
      if (rate >= 80) {
        results.push(`Today's ${rate}% habit completion correlates with high-performance days.`);
      }
    }

    // Optimal pomodoro
    if (dnaStore.optimalPomodoroLength !== 25) {
      results.push(`Your optimal focus session length is ${dnaStore.optimalPomodoroLength} minutes.`);
    }

    return results;
  }, [dnaStore, habitsStore, momentum, detoxHistory]);

  return {
    peakHours: dnaStore.peakHours,
    weakestDays: dnaStore.weakestDays,
    optimalPomodoro: dnaStore.optimalPomodoroLength,
    insights,
    lastAnalysis: dnaStore.lastAnalysis,
    analyzePatterns: dnaStore.analyzePatterns,
    focusPatterns: dnaStore.focusPatterns,
  };
}
