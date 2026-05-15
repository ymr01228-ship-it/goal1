import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Badge,
  DailyDetoxScore,
  ActivePenalty,
  DailyMomentum,
  Challenge90Day,
  IdentityStatement,
} from '@/types/gamification.types';
import { generateId, getToday } from '@/lib/utils';

const DEFAULT_BADGES: Badge[] = [
  { id: 'first-flame', name: 'First Flame', description: '3-day streak', icon: '🔥', category: 'consistency', isUnlocked: false, unlockedAt: null, requirement: '3-day streak' },
  { id: 'week-warrior', name: 'Week Warrior', description: '7-day streak', icon: '⚡', category: 'consistency', isUnlocked: false, unlockedAt: null, requirement: '7-day streak' },
  { id: 'mountain-climber', name: 'Mountain Climber', description: '30-day streak', icon: '🏔️', category: 'consistency', isUnlocked: false, unlockedAt: null, requirement: '30-day streak' },
  { id: 'diamond-focus', name: 'Diamond Focus', description: '90-day streak', icon: '💎', category: 'consistency', isUnlocked: false, unlockedAt: null, requirement: '90-day streak' },
  { id: 'first-step', name: 'First Step', description: 'Complete first course lesson', icon: '📚', category: 'learning', isUnlocked: false, unlockedAt: null, requirement: 'Complete first lesson' },
  { id: 'graduate', name: 'Graduate', description: 'Complete an entire course', icon: '🎓', category: 'learning', isUnlocked: false, unlockedAt: null, requirement: 'Complete a course' },
  { id: 'knowledge-seeker', name: 'Knowledge Seeker', description: 'Complete 3 courses', icon: '🧠', category: 'learning', isUnlocked: false, unlockedAt: null, requirement: 'Complete 3 courses' },
  { id: 'guardian', name: 'Guardian', description: 'Block 10 social media attempts', icon: '🛡️', category: 'discipline', isUnlocked: false, unlockedAt: null, requirement: 'Block 10 attempts' },
  { id: 'warrior', name: 'Warrior', description: 'Complete 7 War Mode sessions', icon: '⚔️', category: 'discipline', isUnlocked: false, unlockedAt: null, requirement: '7 War Mode sessions' },
  { id: 'zen-master', name: 'Zen Master', description: '7-day perfect habit week', icon: '🧘', category: 'discipline', isUnlocked: false, unlockedAt: null, requirement: 'Perfect habit week' },
  { id: 'self-aware', name: 'Self-Aware', description: 'Submit journal 7 days in a row', icon: '🪞', category: 'identity', isUnlocked: false, unlockedAt: null, requirement: '7-day journal streak' },
  { id: 'accountable', name: 'Accountable', description: 'Share report with partner for 4 weeks', icon: '🤝', category: 'identity', isUnlocked: false, unlockedAt: null, requirement: '4 weekly reports' },
];

interface GamificationStore {
  xpPoints: number;
  level: number;
  badges: Badge[];
  detoxScore: number;
  detoxHistory: DailyDetoxScore[];
  personalBest: number;
  momentum: DailyMomentum[];
  challenge: Challenge90Day | null;
  identityStatements: IdentityStatement[];
  penalties: ActivePenalty[];
  warModeSessions: number;
  blockAttempts: number;

  addXP: (amount: number) => void;
  unlockBadge: (badgeId: string) => void;
  updateDetoxScore: (delta: number) => void;
  resetDailyDetox: () => void;
  addMomentum: (data: Omit<DailyMomentum, 'date'>) => void;
  setChallenge: (challenge: Challenge90Day) => void;
  completeMilestone: (phaseIndex: number, milestoneId: string, reflection: string) => void;
  addIdentityStatement: (text: string, evidence: string) => void;
  addPenalty: (penalty: Omit<ActivePenalty, 'id'>) => void;
  incrementWarMode: () => void;
  incrementBlockAttempts: () => void;
  getTodayMomentum: () => DailyMomentum | undefined;
}

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      xpPoints: 0,
      level: 1,
      badges: DEFAULT_BADGES,
      detoxScore: 100,
      detoxHistory: [],
      personalBest: 100,
      momentum: [],
      challenge: null,
      identityStatements: [],
      penalties: [],
      warModeSessions: 0,
      blockAttempts: 0,

      addXP: (amount) => {
        const newXP = get().xpPoints + amount;
        const newLevel = Math.floor(newXP / 500) + 1;
        set({ xpPoints: newXP, level: Math.min(newLevel, 10) });
      },

      unlockBadge: (badgeId) => {
        set((state) => ({
          badges: state.badges.map((b) =>
            b.id === badgeId && !b.isUnlocked
              ? { ...b, isUnlocked: true, unlockedAt: new Date().toISOString() }
              : b
          ),
        }));
      },

      updateDetoxScore: (delta) => {
        const newScore = Math.max(0, Math.min(100, get().detoxScore + delta));
        const newBest = Math.max(newScore, get().personalBest);
        set({ detoxScore: newScore, personalBest: newBest });
      },

      resetDailyDetox: () => {
        const today = getToday();
        const { detoxScore, detoxHistory, blockAttempts, warModeSessions } = get();
        const existingToday = detoxHistory.find((d) => d.date === today);
        if (!existingToday) {
          const dailyScore: DailyDetoxScore = {
            date: today,
            score: detoxScore,
            blockAttempts,
            resistances: 0,
            warModeSessions,
            emergencyOverrides: 0,
          };
          set({
            detoxHistory: [...detoxHistory, dailyScore],
            blockAttempts: 0,
          });
        }
      },

      addMomentum: (data) => {
        const today = getToday();
        const entry: DailyMomentum = { ...data, date: today };
        set((state) => {
          const existing = state.momentum.findIndex((m) => m.date === today);
          if (existing >= 0) {
            const updated = [...state.momentum];
            updated[existing] = entry;
            return { momentum: updated };
          }
          return { momentum: [...state.momentum, entry] };
        });
      },

      setChallenge: (challenge) => set({ challenge }),

      completeMilestone: (phaseIndex, milestoneId, reflection) => {
        set((state) => {
          if (!state.challenge) return state;
          const updatedPhases = [...state.challenge.phases];
          updatedPhases[phaseIndex] = {
            ...updatedPhases[phaseIndex],
            milestones: updatedPhases[phaseIndex].milestones.map((m) =>
              m.id === milestoneId
                ? { ...m, isCompleted: true, completedAt: new Date().toISOString(), reflection }
                : m
            ),
          };
          return {
            challenge: { ...state.challenge, phases: updatedPhases },
          };
        });
      },

      addIdentityStatement: (text, evidence) => {
        const statement: IdentityStatement = {
          id: generateId(),
          text,
          evidence,
          generatedAt: new Date().toISOString(),
          weekNumber: Math.ceil((Date.now() - new Date(getToday()).getTime()) / (7 * 24 * 60 * 60 * 1000)),
        };
        set((state) => ({
          identityStatements: [...state.identityStatements, statement],
        }));
      },

      addPenalty: (penalty) => {
        set((state) => ({
          penalties: [...state.penalties, { ...penalty, id: generateId() }],
        }));
      },

      incrementWarMode: () => {
        set((state) => ({ warModeSessions: state.warModeSessions + 1 }));
      },

      incrementBlockAttempts: () => {
        set((state) => ({ blockAttempts: state.blockAttempts + 1 }));
      },

      getTodayMomentum: () => {
        return get().momentum.find((m) => m.date === getToday());
      },
    }),
    {
      name: 'focusos-gamification',
    }
  )
);
