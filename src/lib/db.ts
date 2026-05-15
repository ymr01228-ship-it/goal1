import Dexie, { type Table } from 'dexie';

// Database schema for FocusOS
// Primary storage is Zustand persist (localStorage), but Dexie handles larger datasets

interface FocusSession {
  id?: number;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  task: string;
  type: 'pomodoro' | 'warmode' | 'free';
  completed: boolean;
}

interface BlockLog {
  id?: number;
  url: string;
  timestamp: string;
  date: string;
}

interface HealthLog {
  id?: number;
  type: string;
  timestamp: string;
  date: string;
  dismissed: boolean;
}

class FocusOSDatabase extends Dexie {
  focusSessions!: Table<FocusSession>;
  blockLogs!: Table<BlockLog>;
  healthLogs!: Table<HealthLog>;

  constructor() {
    super('FocusOSDB');
    this.version(1).stores({
      focusSessions: '++id, date, type, completed',
      blockLogs: '++id, date, url, timestamp',
      healthLogs: '++id, date, type, timestamp',
    });
  }
}

export const db = new FocusOSDatabase();

export async function logFocusSession(session: Omit<FocusSession, 'id'>): Promise<void> {
  await db.focusSessions.add(session);
}

export async function logBlockAttempt(url: string): Promise<void> {
  await db.blockLogs.add({
    url,
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],
  });
}

export async function getTodayFocusSessions(): Promise<FocusSession[]> {
  const today = new Date().toISOString().split('T')[0];
  return db.focusSessions.where('date').equals(today).toArray();
}

export async function getWeekFocusSessions(): Promise<FocusSession[]> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split('T')[0];
  return db.focusSessions.where('date').aboveOrEqual(weekAgoStr).toArray();
}
