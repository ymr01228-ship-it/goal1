import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AbandonedGoal } from '@/types/goal.types';
import { getToday, daysSince } from '@/lib/utils';

interface GoalStore {
  goal: string | null;
  commitDate: string | null;
  isCommitted: boolean;
  abandonedGoals: AbandonedGoal[];
  getDaysCount: () => number;
  setGoal: (goal: string) => void;
  abandonGoal: (reason: string) => void;
}

export const useGoalStore = create<GoalStore>()(
  persist(
    (set, get) => ({
      goal: null,
      commitDate: null,
      isCommitted: false,
      abandonedGoals: [],

      getDaysCount: () => {
        const { commitDate } = get();
        if (!commitDate) return 0;
        return daysSince(commitDate);
      },

      setGoal: (goal: string) => {
        set({
          goal,
          commitDate: getToday(),
          isCommitted: true,
        });
      },

      abandonGoal: (reason: string) => {
        const { goal, commitDate, abandonedGoals } = get();
        if (goal && commitDate) {
          const abandoned: AbandonedGoal = {
            text: goal,
            commitDate,
            abandonDate: getToday(),
            daysActive: daysSince(commitDate),
            reason,
          };
          set({
            goal: null,
            commitDate: null,
            isCommitted: false,
            abandonedGoals: [...abandonedGoals, abandoned],
          });
        }
      },
    }),
    {
      name: 'focusos-goal',
    }
  )
);
