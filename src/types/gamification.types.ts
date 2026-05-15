export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'consistency' | 'learning' | 'discipline' | 'identity';
  isUnlocked: boolean;
  unlockedAt: string | null;
  requirement: string;
}

export interface DailyDetoxScore {
  date: string;
  score: number;
  blockAttempts: number;
  resistances: number;
  warModeSessions: number;
  emergencyOverrides: number;
}

export interface ActivePenalty {
  id: string;
  type: 'extra_war_mode' | 'no_relaxation' | 'mandatory_breathing';
  reason: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface DailyMomentum {
  date: string;
  score: number;
  habitsCompleted: number;
  habitsTotal: number;
  studyMinutes: number;
  pomodorosCompleted: number;
  blockAttempts: number;
  journalSubmitted: boolean;
}

export interface Challenge90Day {
  id: string;
  title: string;
  startDate: string;
  phases: ChallengePhase[];
  isActive: boolean;
  completedAt: string | null;
}

export interface ChallengePhase {
  phase: 1 | 2 | 3;
  milestones: ChallengeMilestone[];
}

export interface ChallengeMilestone {
  id: string;
  text: string;
  isCompleted: boolean;
  completedAt: string | null;
  reflection: string;
}

export interface IdentityStatement {
  id: string;
  text: string;
  generatedAt: string;
  weekNumber: number;
  evidence: string;
}

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Beginner',
  2: 'Apprentice',
  3: 'Student',
  4: 'Practitioner',
  5: 'Warrior',
  6: 'Expert',
  7: 'Master',
  8: 'Grandmaster',
  9: 'Legend',
  10: 'Focused Master',
};

export const XP_PER_LEVEL = 500;
