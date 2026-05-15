import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getToday } from '@/lib/utils';

interface AttentionSession {
  date: string;
  focusSeconds: number;
  absenceSeconds: number;
  totalSeconds: number;
}

interface AttentionStore {
  sessions: AttentionSession[];
  isCameraEnabled: boolean;
  isFacePresent: boolean;
  currentSessionStart: number | null;
  currentFocusTime: number;
  currentAbsenceTime: number;
  setCameraEnabled: (enabled: boolean) => void;
  setFacePresent: (present: boolean) => void;
  startSession: () => void;
  endSession: () => void;
  updateFocusTime: (seconds: number) => void;
  updateAbsenceTime: (seconds: number) => void;
  getDailyScore: (date?: string) => number;
  getWeeklyTrend: () => AttentionSession[];
}

export const useAttentionStore = create<AttentionStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      isCameraEnabled: false,
      isFacePresent: false,
      currentSessionStart: null,
      currentFocusTime: 0,
      currentAbsenceTime: 0,

      setCameraEnabled: (enabled) => set({ isCameraEnabled: enabled }),
      setFacePresent: (present) => set({ isFacePresent: present }),

      startSession: () => set({ currentSessionStart: Date.now(), currentFocusTime: 0, currentAbsenceTime: 0 }),

      endSession: () => {
        const { currentFocusTime, currentAbsenceTime } = get();
        const total = currentFocusTime + currentAbsenceTime;
        if (total > 0) {
          const session: AttentionSession = {
            date: getToday(),
            focusSeconds: currentFocusTime,
            absenceSeconds: currentAbsenceTime,
            totalSeconds: total,
          };
          set((state) => ({
            sessions: [...state.sessions, session],
            currentSessionStart: null,
            currentFocusTime: 0,
            currentAbsenceTime: 0,
          }));
        }
      },

      updateFocusTime: (seconds) => {
        set((state) => ({ currentFocusTime: state.currentFocusTime + seconds }));
      },

      updateAbsenceTime: (seconds) => {
        set((state) => ({ currentAbsenceTime: state.currentAbsenceTime + seconds }));
      },

      getDailyScore: (date) => {
        const targetDate = date || getToday();
        const daySessions = get().sessions.filter((s) => s.date === targetDate);
        if (daySessions.length === 0) return 100;
        const totalFocus = daySessions.reduce((sum, s) => sum + s.focusSeconds, 0);
        const totalTime = daySessions.reduce((sum, s) => sum + s.totalSeconds, 0);
        return totalTime > 0 ? Math.round((totalFocus / totalTime) * 100) : 100;
      },

      getWeeklyTrend: () => {
        const sessions = get().sessions;
        const weekDates: string[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          weekDates.push(d.toISOString().split('T')[0]);
        }
        return weekDates.map((date) => {
          const daySessions = sessions.filter((s) => s.date === date);
          return {
            date,
            focusSeconds: daySessions.reduce((sum, s) => sum + s.focusSeconds, 0),
            absenceSeconds: daySessions.reduce((sum, s) => sum + s.absenceSeconds, 0),
            totalSeconds: daySessions.reduce((sum, s) => sum + s.totalSeconds, 0),
          };
        });
      },
    }),
    {
      name: 'focusos-attention',
    }
  )
);
