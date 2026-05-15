export interface Goal {
  id: string;
  text: string;
  commitDate: string;
  isActive: boolean;
  abandonedGoals: AbandonedGoal[];
}

export interface AbandonedGoal {
  text: string;
  commitDate: string;
  abandonDate: string;
  daysActive: number;
  reason: string;
}

export interface GoalCommitmentState {
  step: 'input' | 'confirm' | 'committed';
  inputText: string;
}
