import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FocusPattern {
  hour: number;
  avgProductivity: number;
  sessionCount: number;
}

interface DayPattern {
  dayOfWeek: number;
  avgProductivity: number;
  slipUps: number;
}

interface PersonalDNAStore {
  focusPatterns: FocusPattern[];
  dayPatterns: DayPattern[];
  optimalPomodoroLength: number;
  peakHours: number[];
  weakestDays: number[];
  lastAnalysis: string | null;
  insights: string[];
  updateFocusPattern: (hour: number, productivity: number) => void;
  updateDayPattern: (dayOfWeek: number, productivity: number, hadSlipUp: boolean) => void;
  setOptimalPomodoro: (minutes: number) => void;
  addInsight: (insight: string) => void;
  analyzePatterns: () => void;
}

export const usePersonalDNAStore = create<PersonalDNAStore>()(
  persist(
    (set, get) => ({
      focusPatterns: [],
      dayPatterns: [],
      optimalPomodoroLength: 25,
      peakHours: [],
      weakestDays: [],
      lastAnalysis: null,
      insights: [],

      updateFocusPattern: (hour, productivity) => {
        set((state) => {
          const existing = state.focusPatterns.findIndex((f) => f.hour === hour);
          if (existing >= 0) {
            const patterns = [...state.focusPatterns];
            const p = patterns[existing];
            patterns[existing] = {
              hour,
              avgProductivity: (p.avgProductivity * p.sessionCount + productivity) / (p.sessionCount + 1),
              sessionCount: p.sessionCount + 1,
            };
            return { focusPatterns: patterns };
          }
          return {
            focusPatterns: [...state.focusPatterns, { hour, avgProductivity: productivity, sessionCount: 1 }],
          };
        });
      },

      updateDayPattern: (dayOfWeek, productivity, hadSlipUp) => {
        set((state) => {
          const existing = state.dayPatterns.findIndex((d) => d.dayOfWeek === dayOfWeek);
          if (existing >= 0) {
            const patterns = [...state.dayPatterns];
            const p = patterns[existing];
            patterns[existing] = {
              dayOfWeek,
              avgProductivity: (p.avgProductivity + productivity) / 2,
              slipUps: p.slipUps + (hadSlipUp ? 1 : 0),
            };
            return { dayPatterns: patterns };
          }
          return {
            dayPatterns: [...state.dayPatterns, { dayOfWeek, avgProductivity: productivity, slipUps: hadSlipUp ? 1 : 0 }],
          };
        });
      },

      setOptimalPomodoro: (minutes) => set({ optimalPomodoroLength: minutes }),

      addInsight: (insight) => {
        set((state) => ({
          insights: [insight, ...state.insights].slice(0, 50),
        }));
      },

      analyzePatterns: () => {
        const { focusPatterns, dayPatterns } = get();

        const sortedHours = [...focusPatterns]
          .sort((a, b) => b.avgProductivity - a.avgProductivity)
          .slice(0, 3)
          .map((f) => f.hour);

        const sortedDays = [...dayPatterns]
          .sort((a, b) => a.avgProductivity - b.avgProductivity)
          .slice(0, 2)
          .map((d) => d.dayOfWeek);

        set({
          peakHours: sortedHours,
          weakestDays: sortedDays,
          lastAnalysis: new Date().toISOString(),
        });
      },
    }),
    {
      name: 'focusos-dna',
    }
  )
);
