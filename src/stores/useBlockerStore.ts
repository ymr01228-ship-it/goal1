import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BlockAttempt {
  url: string;
  timestamp: string;
  date: string;
}

interface BlockerStore {
  blockedSites: string[];
  whitelistedSites: string[];
  blockAttempts: BlockAttempt[];
  isMaxSecurity: boolean;
  temporaryAllowUntil: string | null;
  addBlockedSite: (site: string) => void;
  removeBlockedSite: (site: string) => void;
  addWhitelistedSite: (site: string) => void;
  removeWhitelistedSite: (site: string) => void;
  logBlockAttempt: (url: string) => void;
  setMaxSecurity: (enabled: boolean) => void;
  setTemporaryAllow: (minutes: number) => void;
  clearTemporaryAllow: () => void;
  getTodayAttempts: () => number;
  getRecentAttempts: (hours: number) => number;
}

const DEFAULT_BLOCKED = [
  'facebook.com', 'instagram.com', 'twitter.com', 'x.com',
  'tiktok.com', 'reddit.com', 'snapchat.com', 'threads.net',
  'pinterest.com', 'tumblr.com', 'twitch.tv', 'netflix.com',
];

export const useBlockerStore = create<BlockerStore>()(
  persist(
    (set, get) => ({
      blockedSites: DEFAULT_BLOCKED,
      whitelistedSites: [],
      blockAttempts: [],
      isMaxSecurity: false,
      temporaryAllowUntil: null,

      addBlockedSite: (site) => {
        set((state) => ({
          blockedSites: [...new Set([...state.blockedSites, site.toLowerCase()])],
        }));
      },

      removeBlockedSite: (site) => {
        set((state) => ({
          blockedSites: state.blockedSites.filter((s) => s !== site),
        }));
      },

      addWhitelistedSite: (site) => {
        set((state) => ({
          whitelistedSites: [...new Set([...state.whitelistedSites, site.toLowerCase()])],
        }));
      },

      removeWhitelistedSite: (site) => {
        set((state) => ({
          whitelistedSites: state.whitelistedSites.filter((s) => s !== site),
        }));
      },

      logBlockAttempt: (url) => {
        const attempt: BlockAttempt = {
          url,
          timestamp: new Date().toISOString(),
          date: new Date().toISOString().split('T')[0],
        };
        set((state) => ({
          blockAttempts: [...state.blockAttempts, attempt],
        }));
      },

      setMaxSecurity: (enabled) => set({ isMaxSecurity: enabled }),

      setTemporaryAllow: (minutes) => {
        const until = new Date(Date.now() + minutes * 60 * 1000).toISOString();
        set({ temporaryAllowUntil: until });
      },

      clearTemporaryAllow: () => set({ temporaryAllowUntil: null }),

      getTodayAttempts: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().blockAttempts.filter((a) => a.date === today).length;
      },

      getRecentAttempts: (hours) => {
        const cutoff = Date.now() - hours * 60 * 60 * 1000;
        return get().blockAttempts.filter(
          (a) => new Date(a.timestamp).getTime() > cutoff
        ).length;
      },
    }),
    {
      name: 'focusos-blocker',
    }
  )
);
