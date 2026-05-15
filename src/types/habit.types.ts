export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: string;
  isCritical: boolean;
  suggestedTime: string;
  daysOfWeek: number[];
  order: number;
  createdAt: string;
}

export interface HabitCheckIn {
  habitId: string;
  date: string;
  completedAt: string;
}

export interface HabitStats {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  weeklyCompliance: number;
  totalCompletions: number;
}
