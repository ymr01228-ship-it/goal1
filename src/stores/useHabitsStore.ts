import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Habit, HabitCheckIn } from '@/types/habit.types';
import { getToday, generateId } from '@/lib/utils';

interface HabitsStore {
  habits: Habit[];
  checkIns: HabitCheckIn[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'order'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  completeHabit: (habitId: string) => void;
  uncompleteHabit: (habitId: string, date: string) => void;
  isCompletedToday: (habitId: string) => boolean;
  getStreak: (habitId: string) => number;
  getTodayHabits: () => Habit[];
  getTodayProgress: () => { completed: number; total: number };
  getWeeklyCompliance: (habitId: string) => number;
  reorderHabits: (habits: Habit[]) => void;
}

export const useHabitsStore = create<HabitsStore>()(
  persist(
    (set, get) => ({
      habits: [],
      checkIns: [],

      addHabit: (habitData) => {
        const habit: Habit = {
          ...habitData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          order: get().habits.length,
        };
        set((state) => ({ habits: [...state.habits, habit] }));
      },

      updateHabit: (id, updates) => {
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        }));
      },

      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
          checkIns: state.checkIns.filter((c) => c.habitId !== id),
        }));
      },

      completeHabit: (habitId) => {
        const today = getToday();
        const alreadyDone = get().checkIns.some(
          (c) => c.habitId === habitId && c.date === today
        );
        if (!alreadyDone) {
          const checkIn: HabitCheckIn = {
            habitId,
            date: today,
            completedAt: new Date().toISOString(),
          };
          set((state) => ({ checkIns: [...state.checkIns, checkIn] }));
        }
      },

      uncompleteHabit: (habitId, date) => {
        set((state) => ({
          checkIns: state.checkIns.filter(
            (c) => !(c.habitId === habitId && c.date === date)
          ),
        }));
      },

      isCompletedToday: (habitId) => {
        const today = getToday();
        return get().checkIns.some(
          (c) => c.habitId === habitId && c.date === today
        );
      },

      getStreak: (habitId) => {
        const checkIns = get().checkIns
          .filter((c) => c.habitId === habitId)
          .map((c) => c.date)
          .sort()
          .reverse();

        if (checkIns.length === 0) return 0;

        let streak = 0;
        const today = new Date();

        for (let i = 0; i < 365; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];

          if (checkIns.includes(dateStr)) {
            streak++;
          } else if (i > 0) {
            break;
          }
        }
        return streak;
      },

      getTodayHabits: () => {
        const dayOfWeek = new Date().getDay();
        return get().habits.filter((h) =>
          h.daysOfWeek.length === 0 || h.daysOfWeek.includes(dayOfWeek)
        ).sort((a, b) => a.order - b.order);
      },

      getTodayProgress: () => {
        const todayHabits = get().getTodayHabits();
        const completed = todayHabits.filter((h) =>
          get().isCompletedToday(h.id)
        ).length;
        return { completed, total: todayHabits.length };
      },

      getWeeklyCompliance: (habitId) => {
        const now = new Date();
        let completed = 0;
        let total = 0;
        const habit = get().habits.find((h) => h.id === habitId);
        if (!habit) return 0;

        for (let i = 0; i < 7; i++) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const dayOfWeek = d.getDay();

          if (habit.daysOfWeek.length === 0 || habit.daysOfWeek.includes(dayOfWeek)) {
            total++;
            if (get().checkIns.some((c) => c.habitId === habitId && c.date === dateStr)) {
              completed++;
            }
          }
        }
        return total > 0 ? Math.round((completed / total) * 100) : 0;
      },

      reorderHabits: (habits) => {
        set({ habits });
      },
    }),
    {
      name: 'focusos-habits',
    }
  )
);
