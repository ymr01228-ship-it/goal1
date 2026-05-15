import { useState, useEffect } from 'react';
import { getToday, getYesterday } from '@/lib/utils';

export function useMorningCheck() {
  const [showIntervention, setShowIntervention] = useState(false);
  const [missedYesterday, setMissedYesterday] = useState(false);

  useEffect(() => {
    const today = getToday();
    const morningDone = localStorage.getItem('focusos-morning-done');
    const lastVisit = localStorage.getItem('focusos-last-visit');
    const yesterday = getYesterday();

    if (morningDone !== today) {
      setShowIntervention(true);
      setMissedYesterday(lastVisit !== yesterday && lastVisit !== today);
    }
  }, []);

  const dismissIntervention = () => {
    localStorage.setItem('focusos-morning-done', getToday());
    localStorage.setItem('focusos-last-visit', getToday());
    setShowIntervention(false);
  };

  return {
    showIntervention,
    missedYesterday,
    dismissIntervention,
  };
}
