import { useCallback } from 'react';
import { useBlockerStore } from '@/stores/useBlockerStore';
import { useGamificationStore } from '@/stores/useGamificationStore';

export function useSiteBlocker() {
  const blockerStore = useBlockerStore();
  const { incrementBlockAttempts, updateDetoxScore } = useGamificationStore();

  const checkUrl = useCallback((url: string): boolean => {
    const normalizedUrl = url.toLowerCase();

    // Check if temporarily allowed
    if (blockerStore.temporaryAllowUntil) {
      const allowUntil = new Date(blockerStore.temporaryAllowUntil);
      if (allowUntil > new Date()) {
        return false; // Not blocked during temporary allow
      } else {
        blockerStore.clearTemporaryAllow();
      }
    }

    // Check whitelist first
    for (const site of blockerStore.whitelistedSites) {
      if (normalizedUrl.includes(site)) {
        return false; // Not blocked
      }
    }

    // Check blocked sites
    for (const site of blockerStore.blockedSites) {
      if (normalizedUrl.includes(site)) {
        blockerStore.logBlockAttempt(url);
        incrementBlockAttempts();
        updateDetoxScore(-5);
        return true; // Blocked
      }
    }

    // Check for known distraction patterns
    const distractionPatterns = ['/reels', '/shorts', '/explore'];
    for (const pattern of distractionPatterns) {
      if (normalizedUrl.includes(pattern)) {
        blockerStore.logBlockAttempt(url);
        incrementBlockAttempts();
        updateDetoxScore(-5);
        return true; // Blocked
      }
    }

    return false; // Not blocked
  }, [blockerStore, incrementBlockAttempts, updateDetoxScore]);

  return {
    checkUrl,
    blockedSites: blockerStore.blockedSites,
    whitelistedSites: blockerStore.whitelistedSites,
    todayAttempts: blockerStore.getTodayAttempts(),
    recentAttempts: blockerStore.getRecentAttempts(1),
    addBlockedSite: blockerStore.addBlockedSite,
    removeBlockedSite: blockerStore.removeBlockedSite,
    addWhitelistedSite: blockerStore.addWhitelistedSite,
    setTemporaryAllow: blockerStore.setTemporaryAllow,
  };
}
