import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId, getToday } from '@/lib/utils';

interface JournalEntry {
  id: string;
  date: string;
  biggestWin: string;
  biggestObstacle: string;
  tomorrowPriority: string;
  mood: number;
  createdAt: string;
}

interface NightReflection {
  id: string;
  date: string;
  mood: number;
  biggestAchievement: string;
  biggestObstacle: string;
  tomorrowFirst: string;
  aiSummary: string;
  createdAt: string;
}

interface JournalStore {
  entries: JournalEntry[];
  nightReflections: NightReflection[];
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void;
  addNightReflection: (reflection: Omit<NightReflection, 'id' | 'createdAt'>) => void;
  getTodayEntry: () => JournalEntry | undefined;
  getTodayReflection: () => NightReflection | undefined;
  getJournalStreak: () => number;
  getLastNEntries: (n: number) => JournalEntry[];
  hasEntryToday: () => boolean;
}

export const useJournalStore = create<JournalStore>()(
  persist(
    (set, get) => ({
      entries: [],
      nightReflections: [],

      addEntry: (entryData) => {
        const entry: JournalEntry = {
          ...entryData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => {
          const existing = state.entries.findIndex((e) => e.date === entry.date);
          if (existing >= 0) {
            const updated = [...state.entries];
            updated[existing] = entry;
            return { entries: updated };
          }
          return { entries: [...state.entries, entry] };
        });
      },

      addNightReflection: (reflectionData) => {
        const reflection: NightReflection = {
          ...reflectionData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => {
          const existing = state.nightReflections.findIndex((r) => r.date === reflection.date);
          if (existing >= 0) {
            const updated = [...state.nightReflections];
            updated[existing] = reflection;
            return { nightReflections: updated };
          }
          return { nightReflections: [...state.nightReflections, reflection] };
        });
      },

      getTodayEntry: () => {
        const today = getToday();
        return get().entries.find((e) => e.date === today);
      },

      getTodayReflection: () => {
        const today = getToday();
        return get().nightReflections.find((r) => r.date === today);
      },

      getJournalStreak: () => {
        const entries = get().entries.map((e) => e.date).sort().reverse();
        if (entries.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          if (entries.includes(dateStr)) {
            streak++;
          } else if (i > 0) {
            break;
          }
        }
        return streak;
      },

      getLastNEntries: (n) => {
        return get().entries.sort((a, b) => b.date.localeCompare(a.date)).slice(0, n);
      },

      hasEntryToday: () => {
        const today = getToday();
        return get().entries.some((e) => e.date === today);
      },
    }),
    {
      name: 'focusos-journal',
    }
  )
);
