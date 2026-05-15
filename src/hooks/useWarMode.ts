import { useState, useEffect, useCallback } from 'react';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useBlockerStore } from '@/stores/useBlockerStore';

interface WarModeState {
  isActive: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  progress: number;
}

export function useWarMode() {
  const [state, setState] = useState<WarModeState>({
    isActive: false,
    remainingSeconds: 0,
    totalSeconds: 0,
    progress: 0,
  });

  const { incrementWarMode, addXP, unlockBadge, warModeSessions } = useGamificationStore();
  const { setMaxSecurity } = useBlockerStore();

  const startWarMode = useCallback((durationMinutes: number) => {
    const totalSeconds = durationMinutes * 60;
    setState({
      isActive: true,
      remainingSeconds: totalSeconds,
      totalSeconds,
      progress: 0,
    });
    setMaxSecurity(true);
  }, [setMaxSecurity]);

  const endWarMode = useCallback((completed: boolean) => {
    if (completed) {
      incrementWarMode();
      addXP(30);
      if (warModeSessions + 1 >= 7) {
        unlockBadge('warrior');
      }
    }
    setMaxSecurity(false);
    setState({
      isActive: false,
      remainingSeconds: 0,
      totalSeconds: 0,
      progress: 0,
    });
  }, [incrementWarMode, addXP, unlockBadge, warModeSessions, setMaxSecurity]);

  useEffect(() => {
    if (!state.isActive) return;

    const timer = setInterval(() => {
      setState((prev) => {
        if (prev.remainingSeconds <= 1) {
          clearInterval(timer);
          // Auto-complete
          setTimeout(() => endWarMode(true), 100);
          return { ...prev, remainingSeconds: 0, progress: 100 };
        }
        const remaining = prev.remainingSeconds - 1;
        const progress = ((prev.totalSeconds - remaining) / prev.totalSeconds) * 100;
        return { ...prev, remainingSeconds: remaining, progress };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isActive, endWarMode]);

  return {
    ...state,
    startWarMode,
    endWarMode,
  };
}
