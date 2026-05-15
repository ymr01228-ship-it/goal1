import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, CheckSquare, BookOpen, Brain, BarChart3, BookHeart, Trophy, Settings,
  Swords, ChevronLeft, ChevronRight, Globe, Plus, X, Flame,
  Moon, Timer, Shield, AlertTriangle, Heart, Star, Zap, Award,
  TrendingUp, Calendar, ArrowRight, Play, Pause, RotateCcw,
  Send, Trash2, Edit3, Check, Wind, Sparkles,
  Lock, FileText,
  Home, GraduationCap, Crown
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '@/i18n/index';
import { useGoalStore } from '@/stores/useGoalStore';
import { useHabitsStore } from '@/stores/useHabitsStore';
import { useCoursesStore } from '@/stores/useCoursesStore';
import { useAIStore } from '@/stores/useAIStore';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useBlockerStore } from '@/stores/useBlockerStore';
import { useHealthStore } from '@/stores/useHealthStore';
import { useJournalStore } from '@/stores/useJournalStore';
// PersonalDNA store available for advanced features
// import { usePersonalDNAStore } from '@/stores/usePersonalDNAStore';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { cn, getToday, daysSince, generateId, formatDate } from '@/lib/utils';
import { useMotivationQuotes } from '@/hooks/useMotivationQuotes';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip,
  CartesianGrid, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

/* =============================================
   TYPES
============================================= */
type PageId = 'dashboard' | 'habits' | 'courses' | 'ai' | 'analytics' | 'journal' | 'challenge' | 'settings';

/* =============================================
   PARTICLE BACKGROUND
============================================= */
const ParticleCanvas: React.FC = React.memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 165, 0, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(240, 165, 0, ${0.05 * (1 - dist / 120)})`;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40" />;
});
ParticleCanvas.displayName = 'ParticleCanvas';

/* =============================================
   GOAL COMMIT CEREMONY
============================================= */
const GoalCommitCeremony: React.FC<{ onCommit: (goal: string) => void }> = ({ onCommit }) => {
  const { t } = useTranslation();
  const [goalText, setGoalText] = useState('');
  const [step, setStep] = useState<'input' | 'confirm'>('input');

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#080808]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ParticleCanvas />
      <motion.div
        className="relative z-10 max-w-xl w-full mx-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', damping: 20 }}
      >
        <div className="text-center mb-10">
          <motion.div
            className="text-6xl mb-4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            🎯
          </motion.div>
          <h1 className="text-4xl font-black text-white mb-3">{t('goal.commitTitle')}</h1>
          <p className="text-[#888] text-lg">{t('goal.commitSubtitle')}</p>
        </div>

        {step === 'input' ? (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <textarea
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder={t('goal.placeholder')}
              className="w-full h-32 p-5 rounded-2xl bg-[#0F0F0F] border border-[#1E1E1E] text-white text-lg resize-none focus:border-[#F0A500] focus:ring-2 focus:ring-[#F0A500]/20 transition-all"
              autoFocus
            />
            <Button
              size="lg"
              className="w-full mt-4 text-lg h-14"
              onClick={() => goalText.trim() && setStep('confirm')}
              disabled={!goalText.trim()}
            >
              <ArrowRight size={20} />
              {t('common.next')}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center"
          >
            <Card variant="glass" className="mb-6 p-8">
              <p className="text-sm text-[#888] mb-2">{t('goal.title')}</p>
              <p className="text-2xl font-bold text-white">{goalText}</p>
            </Card>
            <Button
              size="lg"
              className="w-full text-lg h-14 animate-glow-gold"
              onClick={() => onCommit(goalText.trim())}
            >
              <Target size={20} />
              {t('goal.commitButton')}
            </Button>
            <button
              className="mt-3 text-[#888] hover:text-white text-sm transition-colors"
              onClick={() => setStep('input')}
            >
              {t('common.back')}
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

/* =============================================
   GOAL GUARD (Abandon Confirmation)
============================================= */
const GoalGuard: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { goal, getDaysCount, abandonGoal } = useGoalStore();
  const [confirmText, setConfirmText] = useState('');
  const days = getDaysCount();

  const handleAbandon = () => {
    abandonGoal(confirmText);
    setConfirmText('');
    onClose();
  };

  const isConfirmed = confirmText.toLowerCase().includes('i understand') ||
    confirmText.includes('أنا أفهم') ||
    confirmText.toLowerCase().includes('ich verstehe');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('goal.changeGoal')} size="md">
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/20">
          <p className="text-[#FF3B30] font-semibold flex items-center gap-2">
            <AlertTriangle size={18} />
            {t('goal.abandonWarning', { days })}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#0F0F0F]">
          <p className="text-white font-semibold mb-1">{t('goal.title')}:</p>
          <p className="text-[#F0A500]">{goal}</p>
          <p className="text-[#888] text-sm mt-2">
            {t('goal.committedFor')} {days} {days === 1 ? t('goal.day') : t('goal.days')}
          </p>
        </div>
        <div>
          <label className="text-sm text-[#888] block mb-2">{t('goal.abandonConfirm')}</label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={t('goal.abandonPlaceholder')}
            className="w-full p-3 rounded-xl text-sm"
          />
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            {t('goal.cancelButton')}
          </Button>
          <Button variant="danger" onClick={handleAbandon} disabled={!isConfirmed} className="flex-1">
            {t('goal.abandonButton')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

/* =============================================
   MORNING INTERVENTION
============================================= */
const MorningIntervention: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
  const { t } = useTranslation();
  const { getDaysCount } = useGoalStore();
  const days = getDaysCount();
  const lastVisit = localStorage.getItem('focusos-last-visit');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const missedYesterday = lastVisit !== yesterdayStr && lastVisit !== getToday();
  const [canDismiss, setCanDismiss] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCanDismiss(true), missedYesterday ? 8000 : 2000);
    return () => clearTimeout(timer);
  }, [missedYesterday]);

  const handleDismiss = () => {
    localStorage.setItem('focusos-last-visit', getToday());
    localStorage.setItem('focusos-morning-done', getToday());
    onDismiss();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className={cn(
        "absolute inset-0",
        missedYesterday ? "bg-[#FF3B30]/10" : "bg-[#30D158]/5"
      )} />
      <div className="absolute inset-0 bg-[#080808]/90" />

      <motion.div
        className="relative z-10 max-w-lg w-full mx-4 text-center"
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        {missedYesterday ? (
          <>
            <motion.div
              className="text-6xl mb-4"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              ⚠️
            </motion.div>
            <h1 className="text-3xl font-black text-[#FF3B30] mb-2">{t('morning.missedTitle')}</h1>
            <p className="text-[#888] mb-6">{t('morning.missedSubtitle')}</p>
            <Card variant="elevated" className="mb-6 text-left">
              <h3 className="text-sm font-semibold text-[#FF6B00] mb-3">{t('morning.correctiveActions')}</h3>
              <ul className="space-y-2 text-sm text-[#888]">
                <li className="flex items-start gap-2">
                  <span className="text-[#F0A500] mt-1">1.</span>
                  Start with your most important task immediately
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F0A500] mt-1">2.</span>
                  Complete at least 2 Pomodoro sessions today
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F0A500] mt-1">3.</span>
                  Log your journal entry before bed tonight
                </li>
              </ul>
            </Card>
          </>
        ) : (
          <>
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              🔥
            </motion.div>
            <h1 className="text-3xl font-black text-[#30D158] mb-2">{t('morning.welcomeBack')}</h1>
            <p className="text-[#888] mb-6">{t('morning.streakMessage', { days })}</p>
          </>
        )}

        <AnimatePresence>
          {canDismiss && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Button
                size="lg"
                variant={missedYesterday ? 'danger' : 'primary'}
                onClick={handleDismiss}
                className="w-full"
              >
                {missedYesterday ? t('morning.acknowledgeButton') : t('morning.continueButton')}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

/* =============================================
   QUOTE TICKER
============================================= */
const QuoteTicker: React.FC = React.memo(() => {
  const { currentQuote, isFavorite, toggleFavorite } = useMotivationQuotes(180000);

  if (!currentQuote) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentQuote.text}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-lg w-full mx-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <div className="glass-panel rounded-2xl p-4 flex items-start gap-3">
          <Sparkles className="text-[#F0A500] shrink-0 mt-0.5" size={16} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white/90 italic leading-relaxed">"{currentQuote.text}"</p>
            <p className="text-xs text-[#888] mt-1">— {currentQuote.author}</p>
          </div>
          <button
            onClick={() => toggleFavorite(currentQuote)}
            className={cn("shrink-0 p-1 transition-colors", isFavorite(currentQuote) ? "text-[#F0A500]" : "text-[#333] hover:text-[#888]")}
            aria-label="Favorite quote"
          >
            <Star size={14} fill={isFavorite(currentQuote) ? 'currentColor' : 'none'} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});
QuoteTicker.displayName = 'QuoteTicker';

/* =============================================
   HEALTH REMINDERS
============================================= */
const HealthReminderOverlay: React.FC = () => {
  const { t } = useTranslation();
  const reminderSettings = useHealthStore((state) => state.reminderSettings);
  const shouldShowReminder = useHealthStore((state) => state.shouldShowReminder);
  const updateLastReminder = useHealthStore((state) => state.updateLastReminder);
  const logWater = useHealthStore((state) => state.logWater);
  const [activeReminder, setActiveReminder] = useState<string | null>(null);

  useEffect(() => {
    if (!reminderSettings.enabled) return;
    const check = () => {
      const types = [
        { type: 'water', interval: reminderSettings.waterInterval },
        { type: 'stretch', interval: reminderSettings.stretchInterval },
        { type: 'eyes', interval: reminderSettings.eyeRestInterval },
        { type: 'posture', interval: reminderSettings.postureInterval },
        { type: 'breathe', interval: reminderSettings.breathInterval },
      ];
      for (const { type, interval } of types) {
        if (shouldShowReminder(type, interval)) {
          setActiveReminder(type);
          updateLastReminder(type);
          break;
        }
      }
    };
    const timer = setInterval(check, 60000);
    return () => clearInterval(timer);
  }, [reminderSettings, shouldShowReminder, updateLastReminder]);

  if (!activeReminder) return null;

  const reminderIcons: Record<string, string> = {
    water: '💧', stretch: '🏃', eyes: '👁️', posture: '🪑', breathe: '🌬️',
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-20 right-4 z-40 max-w-xs"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
      >
        <Card variant="glass" padding="sm" className="flex items-center gap-3">
          <span className="text-2xl">{reminderIcons[activeReminder]}</span>
          <div className="flex-1">
            <p className="text-sm text-white">{t(`health.${activeReminder}`)}</p>
          </div>
          <button
            onClick={() => {
              if (activeReminder === 'water') logWater();
              setActiveReminder(null);
            }}
            className="px-3 py-1 rounded-lg bg-[#1E1E1E] text-xs text-[#888] hover:text-white transition-colors"
          >
            {t('health.dismiss')}
          </button>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

/* =============================================
   SIDEBAR
============================================= */
interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = React.memo(({ currentPage, onNavigate, isCollapsed, onToggle }) => {
  const { t } = useTranslation();

  const navItems: { id: PageId; icon: React.ElementType; label: string }[] = [
    { id: 'dashboard', icon: Home, label: t('nav.dashboard') },
    { id: 'habits', icon: CheckSquare, label: t('nav.habits') },
    { id: 'courses', icon: BookOpen, label: t('nav.courses') },
    { id: 'ai', icon: Brain, label: t('nav.aiChat') },
    { id: 'analytics', icon: BarChart3, label: t('nav.analytics') },
    { id: 'journal', icon: BookHeart, label: t('nav.journal') },
    { id: 'challenge', icon: Trophy, label: t('nav.challenge') },
    { id: 'settings', icon: Settings, label: t('nav.settings') },
  ];

  return (
    <motion.aside
      className="fixed top-0 start-0 h-full bg-[#0A0A0A] border-e border-[#1E1E1E] z-30 flex flex-col"
      animate={{ width: isCollapsed ? 64 : 240 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-4 flex items-center gap-3 border-b border-[#1E1E1E] h-16">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F0A500] to-[#FF6B00] flex items-center justify-center shrink-0">
          <Target size={16} className="text-black" />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              className="font-black text-lg text-white whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              FocusOS
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
              currentPage === id
                ? 'bg-[#F0A500]/10 text-[#F0A500]'
                : 'text-[#888] hover:text-white hover:bg-[#161616]'
            )}
            aria-label={label}
            title={isCollapsed ? label : undefined}
          >
            <Icon size={18} className="shrink-0" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  className="whitespace-nowrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        ))}
      </nav>

      <button
        onClick={onToggle}
        className="p-4 border-t border-[#1E1E1E] text-[#888] hover:text-white transition-colors flex items-center justify-center"
        aria-label={isCollapsed ? t('nav.expand') : t('nav.collapse')}
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </motion.aside>
  );
});
Sidebar.displayName = 'Sidebar';

/* =============================================
   TOP BAR
============================================= */
const TopBar: React.FC<{ sidebarWidth: number }> = React.memo(({ sidebarWidth }) => {
  const { t, i18n } = useTranslation();
  const { goal, getDaysCount, isCommitted } = useGoalStore();
  const [showGuard, setShowGuard] = useState(false);
  const days = getDaysCount();

  const changeLanguage = useCallback((lang: string) => {
    i18n.changeLanguage(lang);
  }, [i18n]);

  return (
    <>
      <header
        className="fixed top-0 end-0 h-16 bg-[#080808]/90 backdrop-blur-xl border-b border-[#1E1E1E] z-20 flex items-center justify-between px-6"
        style={{ insetInlineStart: sidebarWidth }}
      >
        {/* Goal display */}
        {isCommitted && goal && (
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#F0A500] animate-glow-gold" />
            <div>
              <p className="text-xs text-[#888]">{t('goal.title')}</p>
              <p className="text-sm font-semibold text-white truncate max-w-md">{goal}</p>
            </div>
            <Badge variant="gold">
              {days} {days === 1 ? t('goal.day') : t('goal.days')}
            </Badge>
            <button
              onClick={() => setShowGuard(true)}
              className="text-[#333] hover:text-[#888] transition-colors"
              aria-label={t('goal.changeGoal')}
            >
              <Edit3 size={14} />
            </button>
          </div>
        )}
        {!isCommitted && (
          <div className="text-[#888] text-sm">{t('goal.noGoal')}</div>
        )}

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="flex items-center gap-1 bg-[#0F0F0F] rounded-xl p-1 border border-[#1E1E1E]">
            {['en', 'ar', 'de'].map((lang) => (
              <button
                key={lang}
                onClick={() => changeLanguage(lang)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all',
                  i18n.language === lang
                    ? 'bg-[#F0A500] text-black'
                    : 'text-[#888] hover:text-white'
                )}
                aria-label={`Switch to ${lang}`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>
      <GoalGuard isOpen={showGuard} onClose={() => setShowGuard(false)} />
    </>
  );
});
TopBar.displayName = 'TopBar';

/* =============================================
   DASHBOARD PAGE
============================================= */
const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { goal, getDaysCount } = useGoalStore();
  const habitsStore = useHabitsStore();
  const { detoxScore, personalBest, xpPoints, level, badges, momentum, identityStatements } = useGamificationStore();
  const { entries } = useJournalStore();
  const days = getDaysCount();
  const todayProgress = habitsStore.getTodayProgress();

  // Momentum data for chart
  const momentumData = useMemo(() => {
    const last30 = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = momentum.find((m) => m.date === dateStr);
      last30.push({
        date: dateStr.slice(5),
        score: entry?.score ?? 0,
      });
    }
    return last30;
  }, [momentum]);

  const latestIdentity = identityStatements.length > 0
    ? identityStatements[identityStatements.length - 1]
    : null;

  const unlockedBadges = badges.filter((b) => b.isUnlocked);
  const journalStreak = entries.length > 0 ? entries.filter((e) => {
    const d = new Date(e.date);
    const today = new Date();
    const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
    return diff <= 7;
  }).length : 0;

  // Detox color
  const detoxColor = detoxScore >= 80 ? '#30D158' : detoxScore >= 60 ? '#F0A500' : detoxScore >= 40 ? '#FF6B00' : '#FF3B30';

  return (
    <div className="space-y-6">
      {/* Goal Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#F0A500]/5 to-[#FF6B00]/5 border border-[#F0A500]/10 p-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#F0A500] font-semibold uppercase tracking-wider mb-1">{t('goal.title')}</p>
            <h1 className="text-2xl font-black text-white mb-2">{goal}</h1>
            <div className="flex items-center gap-4 text-sm text-[#888]">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} /> {t('goal.committedFor')} <span className="text-[#F0A500] font-bold">{days}</span> {days === 1 ? t('goal.day') : t('goal.days')}
              </span>
              <span className="flex items-center gap-1.5">
                <Zap size={14} className="text-[#F0A500]" /> {t('gamification.level')} {level}
              </span>
              <span className="flex items-center gap-1.5">
                <Star size={14} className="text-[#F0A500]" /> {xpPoints} {t('gamification.xp')}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-5xl font-black text-[#F0A500]">{days}</p>
            <p className="text-xs text-[#888]">{t('goal.days')}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Habits */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card variant="elevated">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#888]">{t('habits.todayProgress')}</span>
              <CheckSquare size={16} className="text-[#30D158]" />
            </div>
            <p className="text-3xl font-black text-white">
              {todayProgress.completed}<span className="text-lg text-[#888]">/{todayProgress.total}</span>
            </p>
            <Progress
              value={todayProgress.completed}
              max={todayProgress.total || 1}
              variant="success"
              className="mt-3"
            />
          </Card>
        </motion.div>

        {/* Detox Score */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card variant="elevated">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#888]">{t('gamification.detoxScore')}</span>
              <Shield size={16} style={{ color: detoxColor }} />
            </div>
            <p className="text-3xl font-black" style={{ color: detoxColor }}>
              {detoxScore}
            </p>
            <p className="text-xs text-[#888] mt-1">
              {t('gamification.personalBest')}: {personalBest}
            </p>
            <Progress value={detoxScore} variant={detoxScore >= 60 ? 'gold' : 'danger'} className="mt-3" />
          </Card>
        </motion.div>

        {/* Journal Streak */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card variant="elevated">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#888]">{t('focus.journal')}</span>
              <BookHeart size={16} className="text-[#F0A500]" />
            </div>
            <p className="text-3xl font-black text-white">{journalStreak}</p>
            <p className="text-xs text-[#888] mt-1">{t('common.thisWeek')}</p>
          </Card>
        </motion.div>

        {/* Badges */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card variant="elevated">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#888]">{t('gamification.badges')}</span>
              <Award size={16} className="text-[#F0A500]" />
            </div>
            <p className="text-3xl font-black text-white">
              {unlockedBadges.length}<span className="text-lg text-[#888]">/{badges.length}</span>
            </p>
            <div className="flex gap-1 mt-2 flex-wrap">
              {unlockedBadges.slice(0, 5).map((b) => (
                <span key={b.id} className="text-lg" title={b.name}>{b.icon}</span>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Momentum Graph */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card variant="elevated">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-[#F0A500]" />
              {t('gamification.momentum')}
            </h3>
            <span className="text-xs text-[#888]">30 {t('goal.days')}</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={momentumData}>
                <defs>
                  <linearGradient id="momentumGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F0A500" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#F0A500" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1E1E1E" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <RechartsTooltip
                  contentStyle={{ background: '#0F0F0F', border: '1px solid #1E1E1E', borderRadius: 12 }}
                  labelStyle={{ color: '#888' }}
                  itemStyle={{ color: '#F0A500' }}
                />
                <Area type="monotone" dataKey="score" stroke="#F0A500" fill="url(#momentumGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Identity Mirror */}
      {latestIdentity && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card variant="glass" className="border-[#F0A500]/10">
            <div className="flex items-center gap-2 mb-3">
              <Crown size={16} className="text-[#F0A500]" />
              <h3 className="text-sm font-semibold text-[#F0A500]">{t('gamification.identity')}</h3>
            </div>
            <p className="text-lg text-white font-medium italic">"{latestIdentity.text}"</p>
            <p className="text-xs text-[#888] mt-2">{latestIdentity.evidence}</p>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

/* =============================================
   HABITS PAGE
============================================= */
const HabitsPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const store = useHabitsStore();
  const { addXP, unlockBadge } = useGamificationStore();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', icon: '✅', color: '#F0A500', category: 'productivity',
    isCritical: false, suggestedTime: '09:00', daysOfWeek: [] as number[],
  });

  const todayHabits = store.getTodayHabits();
  const todayProgress = store.getTodayProgress();

  const handleSave = () => {
    if (!formData.name.trim()) return;
    if (editId) {
      store.updateHabit(editId, formData);
    } else {
      store.addHabit(formData);
    }
    setShowForm(false);
    setEditId(null);
    setFormData({ name: '', icon: '✅', color: '#F0A500', category: 'productivity', isCritical: false, suggestedTime: '09:00', daysOfWeek: [] });
    toast('success', t('common.success'));
  };

  const handleComplete = (habitId: string) => {
    const isAlready = store.isCompletedToday(habitId);
    if (isAlready) {
      store.uncompleteHabit(habitId, getToday());
    } else {
      store.completeHabit(habitId);
      addXP(10);
      const streak = store.getStreak(habitId);
      if (streak >= 3) unlockBadge('first-flame');
      if (streak >= 7) unlockBadge('week-warrior');
      if (streak >= 30) unlockBadge('mountain-climber');
      toast('success', '✅ +10 XP');
    }
  };

  const EMOJIS = ['✅', '📚', '💪', '🧘', '💧', '🏃', '📝', '🎯', '🧠', '🌅', '💤', '🍎', '🎵', '💻', '📖'];
  const COLORS = ['#F0A500', '#FF6B00', '#30D158', '#FF3B30', '#007AFF', '#AF52DE', '#FF2D55', '#5AC8FA'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">{t('habits.title')}</h1>
          <p className="text-sm text-[#888] mt-1">
            {t('habits.todayProgress')}: {todayProgress.completed}/{todayProgress.total}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} />
          {t('habits.addHabit')}
        </Button>
      </div>

      {/* Progress bar */}
      <Progress value={todayProgress.completed} max={todayProgress.total || 1} variant="gold" size="lg" showLabel />

      {/* Habits list */}
      <div className="space-y-3">
        <AnimatePresence>
          {todayHabits.map((habit, idx) => {
            const isCompleted = store.isCompletedToday(habit.id);
            const streak = store.getStreak(habit.id);
            const compliance = store.getWeeklyCompliance(habit.id);

            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  variant={isCompleted ? 'default' : 'elevated'}
                  className={cn(
                    'flex items-center gap-4 cursor-pointer transition-all hover:border-[#333]',
                    isCompleted && 'opacity-70 border-[#30D158]/20'
                  )}
                  onClick={() => handleComplete(habit.id)}
                >
                  <motion.div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border-2 transition-all',
                      isCompleted ? 'bg-[#30D158]/20 border-[#30D158]' : 'border-[#1E1E1E]'
                    )}
                    whileTap={{ scale: 0.85 }}
                    animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
                  >
                    {isCompleted ? <Check size={18} className="text-[#30D158]" /> : habit.icon}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn('font-semibold text-sm', isCompleted ? 'line-through text-[#888]' : 'text-white')}>
                        {habit.name}
                      </p>
                      {habit.isCritical && (
                        <Badge variant="danger" size="sm">{t('habits.critical')}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-[#888] flex items-center gap-1">
                        <Flame size={12} className="text-[#FF6B00]" /> {streak}
                      </span>
                      <span className="text-xs text-[#888]">{compliance}% {t('habits.weeklyCompliance')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#888]">{habit.suggestedTime}</span>
                    <button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setEditId(habit.id); 
                        setFormData({
                          name: habit.name,
                          icon: habit.icon,
                          color: habit.color,
                          category: habit.category,
                          isCritical: habit.isCritical,
                          suggestedTime: habit.suggestedTime,
                          daysOfWeek: habit.daysOfWeek,
                        }); 
                        setShowForm(true); 
                      }}
                      className="p-1.5 text-[#333] hover:text-[#888] transition-colors"
                      aria-label={t('common.edit')}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); store.deleteHabit(habit.id); }}
                      className="p-1.5 text-[#333] hover:text-[#FF3B30] transition-colors"
                      aria-label={t('common.delete')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {todayHabits.length === 0 && (
          <div className="text-center py-16">
            <CheckSquare size={48} className="text-[#1E1E1E] mx-auto mb-4" />
            <p className="text-[#888]">{t('habits.addHabit')}</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditId(null); }} title={editId ? t('habits.editHabit') : t('habits.addHabit')}>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#888] block mb-1">{t('habits.name')}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              placeholder={t('habits.name')}
              className="w-full p-3 rounded-xl text-sm"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-[#888] block mb-1">{t('habits.icon')}</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setFormData((p) => ({ ...p, icon: e }))}
                  className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-lg border-2 transition-all',
                    formData.icon === e ? 'border-[#F0A500] bg-[#F0A500]/10' : 'border-[#1E1E1E] hover:border-[#333]'
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-[#888] block mb-1">{t('habits.color')}</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setFormData((p) => ({ ...p, color: c }))}
                  className={cn('w-8 h-8 rounded-full border-2 transition-all',
                    formData.color === c ? 'border-white scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-[#888] block mb-1">{t('habits.suggestedTime')}</label>
            <input
              type="time"
              value={formData.suggestedTime}
              onChange={(e) => setFormData((p) => ({ ...p, suggestedTime: e.target.value }))}
              className="w-full p-3 rounded-xl text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.isCritical}
              onChange={(e) => setFormData((p) => ({ ...p, isCritical: e.target.checked }))}
              className="w-4 h-4 rounded accent-[#FF3B30]"
              id="critical"
            />
            <label htmlFor="critical" className="text-sm text-white">{t('habits.critical')}</label>
            <span className="text-xs text-[#888]">{t('habits.criticalDesc')}</span>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setShowForm(false); setEditId(null); }} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} className="flex-1" disabled={!formData.name.trim()}>
              {t('common.save')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

/* =============================================
   COURSES PAGE
============================================= */
const CoursesPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const store = useCoursesStore();
  const { addXP, unlockBadge } = useGamificationStore();
  const { goal } = useGoalStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', platform: '', url: '', totalLessons: 1, isRelevant: true, relevanceReason: '',
  });

  const handleAddCourse = () => {
    if (!formData.name.trim()) return;
    store.addCourse({ ...formData, isRelevant: true, relevanceReason: `Related to: ${goal}` });
    setShowForm(false);
    setFormData({ name: '', platform: '', url: '', totalLessons: 1, isRelevant: true, relevanceReason: '' });
    addXP(25);
    toast('success', t('common.success'));
  };

  const handleIncrement = (id: string) => {
    store.incrementLesson(id);
    addXP(15);
    unlockBadge('first-step');
    const course = store.courses.find((c) => c.id === id);
    if (course && course.completedLessons + 1 >= course.totalLessons) {
      unlockBadge('graduate');
      toast('success', '🎓 Course completed! +50 XP');
      addXP(50);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">{t('courses.title')}</h1>
          <p className="text-sm text-[#888] mt-1">{store.courses.length} courses · {store.getOverallProgress()}% overall</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} />
          {t('courses.addCourse')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {store.courses.map((course) => {
          const progress = course.totalLessons > 0 ? Math.round((course.completedLessons / course.totalLessons) * 100) : 0;
          return (
            <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card variant="elevated" className="relative overflow-hidden">
                {progress >= 100 && (
                  <div className="absolute top-3 end-3">
                    <Badge variant="success">✓ Complete</Badge>
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F0A500]/20 to-[#FF6B00]/20 flex items-center justify-center shrink-0">
                    <GraduationCap size={20} className="text-[#F0A500]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm truncate">{course.name}</h3>
                    <p className="text-xs text-[#888] mt-0.5">{course.platform || 'Online Course'}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Progress value={course.completedLessons} max={course.totalLessons} variant="gold" className="flex-1" />
                      <span className="text-xs text-[#888] shrink-0">{course.completedLessons}/{course.totalLessons}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Button size="sm" variant="secondary" onClick={() => store.decrementLesson(course.id)} disabled={course.completedLessons <= 0}>
                        -
                      </Button>
                      <span className="text-sm font-bold text-[#F0A500]">{progress}%</span>
                      <Button size="sm" onClick={() => handleIncrement(course.id)} disabled={course.completedLessons >= course.totalLessons}>
                        +
                      </Button>
                      <div className="flex-1" />
                      <button
                        onClick={() => store.deleteCourse(course.id)}
                        className="p-1.5 text-[#333] hover:text-[#FF3B30] transition-colors"
                        aria-label={t('common.delete')}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {store.courses.length === 0 && (
        <div className="text-center py-16">
          <BookOpen size={48} className="text-[#1E1E1E] mx-auto mb-4" />
          <p className="text-[#888]">{t('courses.addCourse')}</p>
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={t('courses.addCourse')}>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#888] block mb-1">{t('courses.courseName')}</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} className="w-full p-3 rounded-xl text-sm" autoFocus />
          </div>
          <div>
            <label className="text-xs text-[#888] block mb-1">{t('courses.platform')}</label>
            <input type="text" value={formData.platform} onChange={(e) => setFormData((p) => ({ ...p, platform: e.target.value }))} className="w-full p-3 rounded-xl text-sm" placeholder="Udemy, Coursera, etc." />
          </div>
          <div>
            <label className="text-xs text-[#888] block mb-1">{t('courses.url')}</label>
            <input type="url" value={formData.url} onChange={(e) => setFormData((p) => ({ ...p, url: e.target.value }))} className="w-full p-3 rounded-xl text-sm" />
          </div>
          <div>
            <label className="text-xs text-[#888] block mb-1">{t('courses.totalLessons')}</label>
            <input type="number" min={1} value={formData.totalLessons} onChange={(e) => setFormData((p) => ({ ...p, totalLessons: parseInt(e.target.value) || 1 }))} className="w-full p-3 rounded-xl text-sm" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">{t('common.cancel')}</Button>
            <Button onClick={handleAddCourse} className="flex-1" disabled={!formData.name.trim()}>{t('common.save')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

/* =============================================
   AI CHAT PAGE
============================================= */
const AIChatPage: React.FC = () => {
  const { t } = useTranslation();
  const { conversations, addMessage, apiKey } = useAIStore();
  const { goal } = useGoalStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    addMessage('user', input.trim());

    // Simulate AI response since we can't make actual API calls from browser
    setTimeout(() => {
      const responses = [
        `Great question! Based on your goal "${goal || 'your goal'}", I'd recommend breaking this down into smaller tasks and tackling them one at a time. Remember, consistency beats intensity.`,
        `I see you're working hard. Let me analyze your patterns: focus on maintaining your habit streaks and try to complete at least one Pomodoro session today. You've got this!`,
        `That's a thoughtful approach. Consider aligning this with your single goal. Every action should bring you closer to who you want to become. What's the next small step?`,
        `Remember, progress isn't always linear. What matters is showing up every day. Your current streak shows real commitment. Let's channel that energy productively.`,
      ];
      addMessage('assistant', responses[Math.floor(Math.random() * responses.length)]);
    }, 1500);

    setInput('');
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [conversations]);

  const userMessages = conversations.filter((m) => m.role !== 'system');

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black text-white">{t('ai.title')}</h1>
        {!apiKey && <Badge variant="warning">{t('ai.configureFirst')}</Badge>}
      </div>

      <Card variant="elevated" padding="none" className="flex-1 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {userMessages.length === 0 && (
            <div className="text-center py-16">
              <Brain size={48} className="text-[#1E1E1E] mx-auto mb-4" />
              <p className="text-[#888] text-sm">Ask your AI coach anything about your goals, habits, or productivity</p>
            </div>
          )}
          {userMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'ms-auto bg-[#F0A500]/10 text-white rounded-br-md'
                  : 'bg-[#161616] text-[#ccc] rounded-bl-md'
              )}
            >
              {msg.content}
            </motion.div>
          ))}
        </div>

        <div className="p-4 border-t border-[#1E1E1E]">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('ai.placeholder')}
              className="flex-1 p-3 rounded-xl text-sm"
            />
            <Button onClick={handleSend} disabled={!input.trim()}>
              <Send size={16} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

/* =============================================
   JOURNAL PAGE
============================================= */
const JournalPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const store = useJournalStore();
  const { addXP, unlockBadge } = useGamificationStore();
  const [win, setWin] = useState('');
  const [obstacle, setObstacle] = useState('');
  const [tomorrow, setTomorrow] = useState('');
  const [mood, setMood] = useState(3);

  const todayEntry = store.getTodayEntry();
  const streak = store.getJournalStreak();
  const recent = store.getLastNEntries(7);

  const handleSave = () => {
    if (!win.trim() && !obstacle.trim() && !tomorrow.trim()) return;
    store.addEntry({
      date: getToday(),
      biggestWin: win,
      biggestObstacle: obstacle,
      tomorrowPriority: tomorrow,
      mood,
    });
    addXP(20);
    if (streak + 1 >= 7) unlockBadge('self-aware');
    toast('success', t('common.success'));
    setWin(''); setObstacle(''); setTomorrow('');
  };

  const MOODS = ['😢', '😕', '😐', '🙂', '🔥'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">{t('focus.journal')}</h1>
          <p className="text-sm text-[#888] mt-1 flex items-center gap-2">
            <Flame size={14} className="text-[#FF6B00]" /> {streak} day streak
          </p>
        </div>
        {todayEntry && <Badge variant="success">{t('habits.completed')}</Badge>}
      </div>

      {/* Today's Entry Form */}
      <Card variant="elevated">
        <div className="space-y-5">
          {/* Mood */}
          <div>
            <label className="text-sm text-[#888] block mb-2">{t('focus.howWasToday')}</label>
            <div className="flex gap-3">
              {MOODS.map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() => setMood(idx + 1)}
                  className={cn(
                    'w-12 h-12 rounded-xl text-2xl flex items-center justify-center border-2 transition-all',
                    mood === idx + 1 ? 'border-[#F0A500] bg-[#F0A500]/10 scale-110' : 'border-[#1E1E1E] hover:border-[#333]'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-[#888] block mb-1">{t('focus.journalWin')}</label>
            <textarea
              value={win}
              onChange={(e) => setWin(e.target.value)}
              className="w-full p-3 rounded-xl text-sm resize-none h-20"
              placeholder="..."
            />
          </div>

          <div>
            <label className="text-xs text-[#888] block mb-1">{t('focus.journalObstacle')}</label>
            <textarea
              value={obstacle}
              onChange={(e) => setObstacle(e.target.value)}
              className="w-full p-3 rounded-xl text-sm resize-none h-20"
              placeholder="..."
            />
          </div>

          <div>
            <label className="text-xs text-[#888] block mb-1">{t('focus.journalTomorrow')}</label>
            <textarea
              value={tomorrow}
              onChange={(e) => setTomorrow(e.target.value)}
              className="w-full p-3 rounded-xl text-sm resize-none h-20"
              placeholder="..."
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            <FileText size={16} />
            {t('focus.saveEntry')}
          </Button>
        </div>
      </Card>

      {/* Past entries */}
      <div>
        <h3 className="text-sm font-semibold text-[#888] mb-3">Recent Entries</h3>
        <div className="space-y-3">
          {recent.map((entry) => (
            <Card key={entry.id} variant="default" padding="sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#888]">{formatDate(entry.date)}</span>
                <span className="text-lg">{MOODS[(entry.mood || 3) - 1]}</span>
              </div>
              {entry.biggestWin && <p className="text-xs text-[#30D158] mb-1">✦ {entry.biggestWin}</p>}
              {entry.biggestObstacle && <p className="text-xs text-[#FF6B00] mb-1">✦ {entry.biggestObstacle}</p>}
              {entry.tomorrowPriority && <p className="text-xs text-[#888]">→ {entry.tomorrowPriority}</p>}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

/* =============================================
   WAR MODE & POMODORO
============================================= */
const WarModeOverlay: React.FC<{ onExit: () => void; duration: number }> = ({ onExit, duration }) => {
  const { t } = useTranslation();
  const [remaining, setRemaining] = useState(duration * 60);
  const [exitText, setExitText] = useState('');
  const [showExit, setShowExit] = useState(false);
  const { incrementWarMode, addXP, unlockBadge, warModeSessions } = useGamificationStore();
  const warModeSessionsRef = useRef(warModeSessions);
  warModeSessionsRef.current = warModeSessions;

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          incrementWarMode();
          addXP(30);
          if (warModeSessionsRef.current + 1 >= 7) unlockBadge('warrior');
          onExit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onExit, incrementWarMode, addXP, unlockBadge]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = ((duration * 60 - remaining) / (duration * 60)) * 100;

  const canExit = exitText.toLowerCase() === t('focus.exitPhrase').toLowerCase();

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-[#080808] flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#F0A500]/3 to-transparent" />

      <div className="relative z-10 text-center">
        <motion.div
          className="text-5xl mb-6"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          ⚔️
        </motion.div>
        <h1 className="text-3xl font-black text-white mb-2">{t('focus.warMode')}</h1>
        <p className="text-[#888] mb-8">{t('focus.warModeDesc')}</p>

        <div className="text-7xl font-black text-[#F0A500] font-mono mb-4">
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>

        <div className="w-64 mx-auto mb-8">
          <Progress value={progress} variant="gold" size="lg" />
        </div>

        {!showExit ? (
          <button
            onClick={() => setShowExit(true)}
            className="text-xs text-[#333] hover:text-[#888] transition-colors"
          >
            Exit War Mode
          </button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto">
            <p className="text-sm text-[#FF3B30] mb-2">{t('focus.exitWarning')}</p>
            <p className="text-xs text-[#888] mb-3 italic">"{t('focus.exitPhrase')}"</p>
            <input
              type="text"
              value={exitText}
              onChange={(e) => setExitText(e.target.value)}
              className="w-full p-3 rounded-xl text-sm mb-3"
              placeholder="..."
            />
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => { setShowExit(false); setExitText(''); }} className="flex-1">
                {t('common.cancel')}
              </Button>
              <Button variant="danger" size="sm" onClick={onExit} disabled={!canExit} className="flex-1">
                Exit
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const PomodoroTimer: React.FC = () => {
  const { t } = useTranslation();
  const { addXP } = useGamificationStore();
  const { toast } = useToast();
  const [task, setTask] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [remaining, setRemaining] = useState(25 * 60);
  const [sessions, setSessions] = useState(0);
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration] = useState(5);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          if (!isBreak) {
            setSessions((s) => s + 1);
            addXP(20);
            toast('success', '🍅 Pomodoro complete! +20 XP');
            setIsBreak(true);
            // Schedule restart for break
            setTimeout(() => setRemaining(breakDuration * 60), 0);
            return prev;
          } else {
            setIsBreak(false);
            // Schedule restart for focus
            setTimeout(() => setRemaining(focusDuration * 60), 0);
            return prev;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, isBreak, focusDuration, breakDuration, addXP, toast]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const totalSeconds = isBreak ? breakDuration * 60 : focusDuration * 60;
  const progress = ((totalSeconds - remaining) / totalSeconds) * 100;

  const handleStart = () => {
    if (!task.trim() && !isRunning) return;
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setRemaining(focusDuration * 60);
  };

  return (
    <Card variant="elevated">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Timer size={18} className="text-[#F0A500]" />
          <h3 className="font-semibold text-white">{t('focus.pomodoro')}</h3>
          <Badge variant="gold">{sessions} {t('focus.sessions')}</Badge>
        </div>

        {!isRunning && !isBreak && (
          <div className="mb-4">
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder={t('focus.pomodoroTask')}
              className="w-full p-3 rounded-xl text-sm text-center"
            />
            <div className="flex items-center justify-center gap-4 mt-3">
              {[15, 25, 45, 60].map((d) => (
                <button
                  key={d}
                  onClick={() => { setFocusDuration(d); setRemaining(d * 60); }}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
                    focusDuration === d ? 'bg-[#F0A500] text-black' : 'bg-[#1E1E1E] text-[#888] hover:text-white'
                  )}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#1E1E1E" strokeWidth="4" />
            <circle
              cx="50" cy="50" r="45" fill="none"
              stroke={isBreak ? '#30D158' : '#F0A500'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black font-mono text-white">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
            <span className="text-xs text-[#888] mt-1">
              {isBreak ? t('focus.breakTime') : t('focus.focusTime')}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            variant={isRunning ? 'secondary' : 'primary'}
            onClick={() => isRunning ? setIsRunning(false) : handleStart()}
            disabled={!isRunning && !task.trim()}
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
            {isRunning ? 'Pause' : t('focus.pomodoroStart')}
          </Button>
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

/* =============================================
   ANALYTICS PAGE
============================================= */
const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const { momentum, detoxHistory, xpPoints, level, badges } = useGamificationStore();
  const habitsStore = useHabitsStore();
  const { entries } = useJournalStore();

  const weekData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayMomentum = momentum.find((m) => m.date === dateStr);
      const dayDetox = detoxHistory.find((dh) => dh.date === dateStr);
      data.push({
        date: dateStr.slice(5),
        momentum: dayMomentum?.score ?? 0,
        detox: dayDetox?.score ?? 100,
        habits: dayMomentum?.habitsCompleted ?? 0,
        pomodoros: dayMomentum?.pomodorosCompleted ?? 0,
      });
    }
    return data;
  }, [momentum, detoxHistory]);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    habitsStore.habits.forEach((h) => {
      cats[h.category] = (cats[h.category] || 0) + 1;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [habitsStore.habits]);

  const COLORS_PIE = ['#F0A500', '#FF6B00', '#30D158', '#007AFF', '#AF52DE', '#FF2D55'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-white">{t('analytics.title')}</h1>

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="elevated">
          <p className="text-xs text-[#888]">{t('gamification.level')}</p>
          <p className="text-3xl font-black text-[#F0A500]">{level}</p>
          <p className="text-xs text-[#888]">{xpPoints} XP</p>
        </Card>
        <Card variant="elevated">
          <p className="text-xs text-[#888]">{t('analytics.habitsCompleted')}</p>
          <p className="text-3xl font-black text-[#30D158]">{habitsStore.checkIns.length}</p>
        </Card>
        <Card variant="elevated">
          <p className="text-xs text-[#888]">{t('focus.journal')}</p>
          <p className="text-3xl font-black text-white">{entries.length}</p>
          <p className="text-xs text-[#888]">entries</p>
        </Card>
        <Card variant="elevated">
          <p className="text-xs text-[#888]">{t('gamification.badges')}</p>
          <p className="text-3xl font-black text-[#F0A500]">{badges.filter((b) => b.isUnlocked).length}/{badges.length}</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated">
          <h3 className="text-sm font-semibold text-white mb-4">{t('analytics.momentumChart')}</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F0A500" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#F0A500" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1E1E1E" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} />
                <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} />
                <RechartsTooltip contentStyle={{ background: '#0F0F0F', border: '1px solid #1E1E1E', borderRadius: 12 }} />
                <Area type="monotone" dataKey="momentum" stroke="#F0A500" fill="url(#areaGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card variant="elevated">
          <h3 className="text-sm font-semibold text-white mb-4">{t('analytics.detoxTrend')}</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData}>
                <CartesianGrid stroke="#1E1E1E" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} />
                <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} domain={[0, 100]} />
                <RechartsTooltip contentStyle={{ background: '#0F0F0F', border: '1px solid #1E1E1E', borderRadius: 12 }} />
                <Bar dataKey="detox" fill="#30D158" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {categoryData.length > 0 && (
          <Card variant="elevated">
            <h3 className="text-sm font-semibold text-white mb-4">{t('analytics.habitAnalysis')}</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {categoryData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS_PIE[idx % COLORS_PIE.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ background: '#0F0F0F', border: '1px solid #1E1E1E', borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

/* =============================================
   CHALLENGE PAGE (90-Day)
============================================= */
const ChallengePage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { challenge, setChallenge, completeMilestone, addXP } = useGamificationStore();
  const { goal } = useGoalStore();
  const [showSetup, setShowSetup] = useState(false);
  const [title, setTitle] = useState('');
  const [milestoneInputs, setMilestoneInputs] = useState<string[]>(Array(9).fill(''));

  const handleCreate = () => {
    if (!title.trim()) return;
    const phases = [0, 1, 2].map((phaseIdx) => ({
      phase: (phaseIdx + 1) as 1 | 2 | 3,
      milestones: milestoneInputs.slice(phaseIdx * 3, phaseIdx * 3 + 3).map((text) => ({
        id: generateId(),
        text: text || `Milestone ${phaseIdx * 3 + 1}`,
        isCompleted: false,
        completedAt: null,
        reflection: '',
      })),
    }));

    setChallenge({
      id: generateId(),
      title,
      startDate: getToday(),
      phases,
      isActive: true,
      completedAt: null,
    });
    setShowSetup(false);
    toast('success', t('common.success'));
  };

  const handleComplete = (phaseIdx: number, milestoneId: string) => {
    completeMilestone(phaseIdx, milestoneId, 'Completed!');
    addXP(50);
    toast('success', '🎉 Milestone completed! +50 XP');
  };

  if (!challenge) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-black text-white">{t('gamification.challenge')}</h1>
        <div className="text-center py-16">
          <Trophy size={64} className="text-[#1E1E1E] mx-auto mb-4" />
          <p className="text-[#888] mb-6">Start your 90-day challenge to transform your life</p>
          <Button onClick={() => { setShowSetup(true); setTitle(goal || ''); }}>
            <Plus size={16} /> Start Challenge
          </Button>
        </div>

        <Modal isOpen={showSetup} onClose={() => setShowSetup(false)} title="Setup 90-Day Challenge" size="lg">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#888] block mb-1">Challenge Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 rounded-xl text-sm" />
            </div>
            {[0, 1, 2].map((phase) => (
              <div key={phase}>
                <h4 className="text-sm font-semibold text-[#F0A500] mb-2">{t('gamification.phase')} {phase + 1} (Day {phase * 30 + 1}-{(phase + 1) * 30})</h4>
                {[0, 1, 2].map((m) => (
                  <input
                    key={m}
                    type="text"
                    value={milestoneInputs[phase * 3 + m]}
                    onChange={(e) => {
                      const updated = [...milestoneInputs];
                      updated[phase * 3 + m] = e.target.value;
                      setMilestoneInputs(updated);
                    }}
                    placeholder={`${t('gamification.milestone')} ${m + 1}`}
                    className="w-full p-3 rounded-xl text-sm mb-2"
                  />
                ))}
              </div>
            ))}
            <Button onClick={handleCreate} className="w-full" disabled={!title.trim()}>Create Challenge</Button>
          </div>
        </Modal>
      </div>
    );
  }

  const dayNumber = daysSince(challenge.startDate);
  const totalMilestones = challenge.phases.reduce((sum, p) => sum + p.milestones.length, 0);
  const completedMilestones = challenge.phases.reduce((sum, p) => sum + p.milestones.filter((m) => m.isCompleted).length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">{challenge.title}</h1>
          <p className="text-sm text-[#888] mt-1">Day {dayNumber} of 90 · {completedMilestones}/{totalMilestones} milestones</p>
        </div>
        <Badge variant="gold">Day {Math.min(dayNumber, 90)}/90</Badge>
      </div>

      <Progress value={dayNumber} max={90} variant="gold" size="lg" showLabel />

      {challenge.phases.map((phase, phaseIdx) => (
        <Card key={phaseIdx} variant="elevated">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#F0A500]/20 text-[#F0A500] text-xs flex items-center justify-center font-bold">
              {phase.phase}
            </span>
            {t('gamification.phase')} {phase.phase}
            <span className="text-xs text-[#888]">Day {(phaseIdx) * 30 + 1}-{(phaseIdx + 1) * 30}</span>
          </h3>
          <div className="space-y-3">
            {phase.milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border transition-all',
                  milestone.isCompleted ? 'border-[#30D158]/20 bg-[#30D158]/5' : 'border-[#1E1E1E] hover:border-[#333]'
                )}
              >
                <button
                  onClick={() => !milestone.isCompleted && handleComplete(phaseIdx, milestone.id)}
                  className={cn(
                    'w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all',
                    milestone.isCompleted ? 'bg-[#30D158] border-[#30D158]' : 'border-[#333] hover:border-[#F0A500]'
                  )}
                  disabled={milestone.isCompleted}
                >
                  {milestone.isCompleted && <Check size={14} className="text-white" />}
                </button>
                <span className={cn('text-sm', milestone.isCompleted ? 'text-[#888] line-through' : 'text-white')}>
                  {milestone.text}
                </span>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

/* =============================================
   SETTINGS PAGE
============================================= */
const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const aiStore = useAIStore();
  const healthStore = useHealthStore();
  const [apiKey, setApiKey] = useState(aiStore.apiKey);

  const handleSaveAI = () => {
    aiStore.setApiKey(apiKey);
    toast('success', t('common.success'));
  };

  const handleClearData = () => {
    if (confirm(t('settings.clearConfirm'))) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-black text-white">{t('settings.title')}</h1>

      {/* Language */}
      <Card variant="elevated">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Globe size={16} className="text-[#F0A500]" />
          {t('settings.language')}
        </h3>
        <div className="flex gap-2">
          {[
            { code: 'en', label: 'English' },
            { code: 'ar', label: 'العربية' },
            { code: 'de', label: 'Deutsch' },
          ].map(({ code, label }) => (
            <Button
              key={code}
              variant={i18n.language === code ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => i18n.changeLanguage(code)}
            >
              {label}
            </Button>
          ))}
        </div>
      </Card>

      {/* AI Configuration */}
      <Card variant="elevated">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Brain size={16} className="text-[#F0A500]" />
          {t('settings.aiConfig')}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-[#888] block mb-1">{t('ai.provider')}</label>
            <div className="flex gap-2">
              {(['openai', 'anthropic', 'google'] as const).map((p) => (
                <Button
                  key={p}
                  variant={aiStore.provider === p ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => aiStore.setProvider(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-[#888] block mb-1">{t('ai.apiKey')}</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 p-3 rounded-xl text-sm"
                placeholder="sk-..."
              />
              <Button onClick={handleSaveAI} size="sm">{t('common.save')}</Button>
            </div>
            <p className="text-xs text-[#888] mt-1">🔒 Stored locally only. Never sent to any server.</p>
          </div>
        </div>
      </Card>

      {/* Health Reminders */}
      <Card variant="elevated">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Heart size={16} className="text-[#FF3B30]" />
          {t('settings.healthReminders')}
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#888]">Enable Reminders</span>
            <button
              onClick={() => healthStore.updateReminderSettings({ enabled: !healthStore.reminderSettings.enabled })}
              className={cn(
                'w-10 h-6 rounded-full transition-all relative',
                healthStore.reminderSettings.enabled ? 'bg-[#30D158]' : 'bg-[#1E1E1E]'
              )}
            >
              <div className={cn(
                'w-4 h-4 rounded-full bg-white absolute top-1 transition-all',
                healthStore.reminderSettings.enabled ? 'left-5' : 'left-1'
              )} />
            </button>
          </div>
          <div>
            <label className="text-xs text-[#888] block mb-1">{t('settings.bedtime')}</label>
            <input
              type="time"
              value={healthStore.bedtime}
              onChange={(e) => healthStore.setBedtime(e.target.value)}
              className="w-full p-3 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-[#888] block mb-1">💧 Water Interval (min)</label>
            <input
              type="number"
              value={healthStore.reminderSettings.waterInterval}
              onChange={(e) => healthStore.updateReminderSettings({ waterInterval: parseInt(e.target.value) || 45 })}
              className="w-full p-3 rounded-xl text-sm"
            />
          </div>
        </div>
      </Card>

      {/* Blocked Sites */}
      <Card variant="elevated">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Shield size={16} className="text-[#FF3B30]" />
          {t('blocker.blockedSites')}
        </h3>
        <BlockedSitesList />
      </Card>

      {/* Data */}
      <Card variant="elevated">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Lock size={16} className="text-[#888]" />
          {t('settings.privacy')}
        </h3>
        <div className="space-y-2">
          <Button variant="secondary" size="sm" onClick={() => {
            const data = {
              goal: localStorage.getItem('focusos-goal'),
              habits: localStorage.getItem('focusos-habits'),
              journal: localStorage.getItem('focusos-journal'),
              gamification: localStorage.getItem('focusos-gamification'),
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'focusos-backup.json'; a.click();
            URL.revokeObjectURL(url);
          }}>
            {t('settings.exportData')}
          </Button>
          <Button variant="danger" size="sm" onClick={handleClearData}>
            {t('settings.clearData')}
          </Button>
        </div>
      </Card>
    </div>
  );
};

/* =============================================
   BLOCKED SITES LIST (Settings sub-component)
============================================= */
const BlockedSitesList: React.FC = () => {
  const store = useBlockerStore();
  const [newSite, setNewSite] = useState('');

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={newSite}
          onChange={(e) => setNewSite(e.target.value)}
          placeholder="example.com"
          className="flex-1 p-2 rounded-lg text-sm"
        />
        <Button size="sm" onClick={() => { if (newSite.trim()) { store.addBlockedSite(newSite.trim()); setNewSite(''); } }}>
          <Plus size={14} />
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {store.blockedSites.map((site) => (
          <span key={site} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1E1E1E] text-xs text-[#888]">
            {site}
            <button onClick={() => store.removeBlockedSite(site)} className="text-[#FF3B30] hover:text-[#FF3B30]/70">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

/* =============================================
   CRAVING INTERRUPT
============================================= */
const CravingInterrupt: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [feeling, setFeeling] = useState('');
  const [canClose, setCanClose] = useState(false);
  const { updateDetoxScore, addXP } = useGamificationStore();

  useEffect(() => {
    if (isOpen) {
      setCanClose(false);
      const timer = setTimeout(() => setCanClose(true), 120000); // 2 min
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleRefocus = () => {
    updateDetoxScore(3);
    addXP(15);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a1628]/95"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="max-w-lg w-full mx-4 text-center"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        {/* Breathing animation */}
        <motion.div
          className="w-24 h-24 rounded-full bg-blue-500/20 border-2 border-blue-400/30 mx-auto mb-8"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        />

        <h2 className="text-2xl font-black text-white mb-2">{t('craving.wait')}</h2>
        <p className="text-[#888] mb-6">{t('craving.question')}</p>

        <textarea
          value={feeling}
          onChange={(e) => setFeeling(e.target.value)}
          placeholder={t('craving.placeholder')}
          className="w-full p-4 rounded-2xl text-sm resize-none h-28 mb-6"
        />

        <Button
          onClick={handleRefocus}
          disabled={!canClose && !feeling.trim()}
          className="w-full"
          variant="success"
        >
          {canClose || feeling.trim() ? t('craving.refocus') : t('craving.wait')}
        </Button>
      </motion.div>
    </motion.div>
  );
};

/* =============================================
   BREATHING EXERCISE
============================================= */
const BreathingExercise: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const sequence = () => {
      setPhase('inhale');
      setTimeout(() => setPhase('hold'), 4000);
      setTimeout(() => setPhase('exhale'), 11000);
      setTimeout(() => {
        setCycles((c) => c + 1);
      }, 19000);
    };
    sequence();
    const timer = setInterval(sequence, 19000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center py-8">
        <motion.div
          className="w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{
            background: phase === 'inhale' ? 'rgba(48, 209, 88, 0.1)' : phase === 'hold' ? 'rgba(240, 165, 0, 0.1)' : 'rgba(90, 200, 250, 0.1)',
            borderWidth: 2,
            borderColor: phase === 'inhale' ? '#30D158' : phase === 'hold' ? '#F0A500' : '#5AC8FA',
          }}
          animate={{
            scale: phase === 'inhale' ? [1, 1.4] : phase === 'hold' ? 1.4 : [1.4, 1],
          }}
          transition={{ duration: phase === 'inhale' ? 4 : phase === 'hold' ? 7 : 8, ease: 'easeInOut' }}
        >
          <span className="text-lg font-semibold" style={{
            color: phase === 'inhale' ? '#30D158' : phase === 'hold' ? '#F0A500' : '#5AC8FA',
          }}>
            {t(`health.breathing.${phase}`)}
          </span>
        </motion.div>

        <p className="text-sm text-[#888]">Cycle {cycles + 1}</p>

        {cycles >= 3 && (
          <Button onClick={onClose} variant="success" className="mt-6">
            {t('health.breathing.complete')}
          </Button>
        )}
      </div>
    </Modal>
  );
};

/* =============================================
   NIGHT PROTOCOL
============================================= */
const NightProtocol: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { addNightReflection } = useJournalStore();
  const { addXP } = useGamificationStore();
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState(3);
  const [achievement, setAchievement] = useState('');
  const [obstacle, setObstacle] = useState('');
  const [tomorrowFirst, setTomorrowFirst] = useState('');

  const MOODS = ['😢', '😕', '😐', '🙂', '🔥'];

  const handleSubmit = () => {
    addNightReflection({
      date: getToday(),
      mood,
      biggestAchievement: achievement,
      biggestObstacle: obstacle,
      tomorrowFirst,
      aiSummary: '',
    });
    addXP(25);
    toast('success', 'Night reflection saved! +25 XP');
    onClose();
    setStep(0);
  };

  const steps = [
    {
      title: t('focus.howWasToday'),
      content: (
        <div className="flex gap-3 justify-center">
          {MOODS.map((emoji, idx) => (
            <button
              key={idx}
              onClick={() => { setMood(idx + 1); setStep(1); }}
              className={cn(
                'w-14 h-14 rounded-2xl text-3xl flex items-center justify-center border-2 transition-all hover:scale-110',
                mood === idx + 1 ? 'border-[#F0A500] bg-[#F0A500]/10' : 'border-[#1E1E1E]'
              )}
            >
              {emoji}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: t('focus.biggestWin'),
      content: (
        <div>
          <textarea value={achievement} onChange={(e) => setAchievement(e.target.value)} className="w-full p-4 rounded-xl text-sm resize-none h-24" autoFocus />
          <Button onClick={() => setStep(2)} className="w-full mt-3" disabled={!achievement.trim()}>{t('common.next')}</Button>
        </div>
      ),
    },
    {
      title: t('focus.biggestObstacle'),
      content: (
        <div>
          <textarea value={obstacle} onChange={(e) => setObstacle(e.target.value)} className="w-full p-4 rounded-xl text-sm resize-none h-24" autoFocus />
          <Button onClick={() => setStep(3)} className="w-full mt-3" disabled={!obstacle.trim()}>{t('common.next')}</Button>
        </div>
      ),
    },
    {
      title: t('focus.tomorrowPriority'),
      content: (
        <div>
          <textarea value={tomorrowFirst} onChange={(e) => setTomorrowFirst(e.target.value)} className="w-full p-4 rounded-xl text-sm resize-none h-24" autoFocus />
          <Button onClick={handleSubmit} className="w-full mt-3" disabled={!tomorrowFirst.trim()}>
            <Moon size={16} />
            {t('focus.submitReflection')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('focus.nightProtocol')} size="md">
      <div className="py-4">
        <div className="flex gap-1 mb-6">
          {steps.map((_, idx) => (
            <div key={idx} className={cn('flex-1 h-1 rounded-full transition-all', idx <= step ? 'bg-[#F0A500]' : 'bg-[#1E1E1E]')} />
          ))}
        </div>
        <h3 className="text-lg font-semibold text-white mb-4 text-center">{steps[step].title}</h3>
        {steps[step].content}
      </div>
    </Modal>
  );
};

/* =============================================
   EMERGENCY OVERRIDE
============================================= */
const EmergencyOverride: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { updateDetoxScore } = useGamificationStore();
  const [happened, setHappened] = useState('');
  const [different, setDifferent] = useState('');

  const handleSubmit = () => {
    updateDetoxScore(-10);
    toast('warning', t('emergency.consequence'));
    onClose();
    setHappened(''); setDifferent('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('emergency.title')} size="md">
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-[#FF3B30]/5 border border-[#FF3B30]/10 text-center">
          <AlertTriangle size={32} className="text-[#FF3B30] mx-auto mb-2" />
        </div>
        <div>
          <label className="text-xs text-[#888] block mb-1">{t('emergency.whatHappened')}</label>
          <textarea value={happened} onChange={(e) => setHappened(e.target.value)} className="w-full p-3 rounded-xl text-sm resize-none h-20" />
        </div>
        <div>
          <label className="text-xs text-[#888] block mb-1">{t('emergency.whatDifferent')}</label>
          <textarea value={different} onChange={(e) => setDifferent(e.target.value)} className="w-full p-3 rounded-xl text-sm resize-none h-20" />
        </div>
        <Button onClick={handleSubmit} variant="danger" className="w-full" disabled={!happened.trim() || !different.trim()}>
          {t('emergency.submit')}
        </Button>
      </div>
    </Modal>
  );
};

/* =============================================
   BADGES PAGE (within Dashboard/Challenge)
============================================= */
const BadgesDisplay: React.FC = () => {
  const { t } = useTranslation();
  const { badges } = useGamificationStore();

  return (
    <Card variant="elevated">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Award size={16} className="text-[#F0A500]" />
        {t('gamification.badges')}
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {badges.map((badge) => (
          <motion.div
            key={badge.id}
            className={cn(
              'flex flex-col items-center p-3 rounded-xl border text-center transition-all',
              badge.isUnlocked
                ? 'border-[#F0A500]/20 bg-[#F0A500]/5'
                : 'border-[#1E1E1E] opacity-40'
            )}
            whileHover={{ scale: badge.isUnlocked ? 1.05 : 1 }}
          >
            <span className="text-2xl mb-1">{badge.icon}</span>
            <p className="text-[10px] font-semibold text-white truncate w-full">{badge.name}</p>
            {badge.isUnlocked ? (
              <Badge variant="success" size="sm" className="mt-1">{t('gamification.unlocked')}</Badge>
            ) : (
              <span className="text-[9px] text-[#888] mt-1">{t('gamification.locked')}</span>
            )}
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

/* =============================================
   SITE BLOCKER OVERLAY
============================================= */
const SiteBlockerOverlay: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#FF3B30]/10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0 bg-[#080808]/95" />
      <motion.div
        className="relative z-10 text-center max-w-md mx-4"
        animate={{ x: [0, -10, 10, -10, 10, 0] }}
        transition={{ duration: 0.5 }}
      >
        <Shield size={64} className="text-[#FF3B30] mx-auto mb-4" />
        <h1 className="text-2xl font-black text-[#FF3B30] mb-2">{t('blocker.blocked')}</h1>
        <p className="text-[#888] text-sm mb-6">{t('blocker.attemptLogged')}</p>
        {countdown > 0 ? (
          <p className="text-sm text-[#888]">{t('blocker.countdown', { seconds: countdown })}</p>
        ) : (
          <Button variant="secondary" onClick={onDismiss}>{t('common.close')}</Button>
        )}
      </motion.div>
    </motion.div>
  );
};

/* =============================================
   MAIN APP
============================================= */
const AppContent: React.FC = () => {
  const { t } = useTranslation();
  const goalStore = useGoalStore();
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMorning, setShowMorning] = useState(false);
  const [showWarMode, setShowWarMode] = useState(false);
  const [warModeDuration, setWarModeDuration] = useState(25);
  const [showCraving, setShowCraving] = useState(false);
  const [showNightProtocol, setShowNightProtocol] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showBlocker, setShowBlocker] = useState(false);

  const sidebarWidth = sidebarCollapsed ? 64 : 240;

  // Morning check
  useEffect(() => {
    if (goalStore.isCommitted) {
      const morningDone = localStorage.getItem('focusos-morning-done');
      const today = getToday();
      if (morningDone !== today) {
        setShowMorning(true);
      }
    }
  }, [goalStore.isCommitted]);

  // Record visit
  useEffect(() => {
    localStorage.setItem('focusos-last-visit', getToday());
  }, []);

  // If no goal committed, show ceremony
  if (!goalStore.isCommitted) {
    return (
      <GoalCommitCeremony onCommit={(g) => {
        goalStore.setGoal(g);
      }} />
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <DashboardPage />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PomodoroTimer />
              <Card variant="elevated">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Swords size={16} className="text-[#FF6B00]" />
                    {t('focus.warMode')}
                  </h3>
                  <p className="text-xs text-[#888]">{t('focus.warModeDesc')}</p>
                  <div className="flex gap-2">
                    {[25, 60, 120].map((d) => (
                      <button
                        key={d}
                        onClick={() => setWarModeDuration(d)}
                        className={cn(
                          'px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                          warModeDuration === d ? 'bg-[#FF6B00] text-black' : 'bg-[#1E1E1E] text-[#888] hover:text-white'
                        )}
                      >
                        {d}m
                      </button>
                    ))}
                  </div>
                  <Button variant="danger" onClick={() => setShowWarMode(true)} className="w-full">
                    <Swords size={16} />
                    {t('focus.start')}
                  </Button>
                </div>
              </Card>
            </div>
            <BadgesDisplay />
          </div>
        );
      case 'habits': return <HabitsPage />;
      case 'courses': return <CoursesPage />;
      case 'ai': return <AIChatPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'journal': return <JournalPage />;
      case 'challenge': return <ChallengePage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#080808]">
      <ParticleCanvas />

      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <TopBar sidebarWidth={sidebarWidth} />

      {/* Main content */}
      <main
        className="relative z-10 pt-16 transition-all duration-200"
        style={{ marginInlineStart: sidebarWidth }}
      >
        <div className="p-6 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Action Buttons (floating) */}
      <div className="fixed bottom-20 end-4 z-30 flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCraving(true)}
          className="w-12 h-12 rounded-2xl bg-[#161616] border border-[#1E1E1E] flex items-center justify-center text-[#888] hover:text-[#FF6B00] transition-colors shadow-lg"
          aria-label={t('craving.title')}
          title={t('craving.title')}
        >
          <AlertTriangle size={18} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowNightProtocol(true)}
          className="w-12 h-12 rounded-2xl bg-[#161616] border border-[#1E1E1E] flex items-center justify-center text-[#888] hover:text-[#AF52DE] transition-colors shadow-lg"
          aria-label={t('focus.nightProtocol')}
          title={t('focus.nightProtocol')}
        >
          <Moon size={18} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowEmergency(true)}
          className="w-12 h-12 rounded-2xl bg-[#161616] border border-[#1E1E1E] flex items-center justify-center text-[#888] hover:text-[#FF3B30] transition-colors shadow-lg"
          aria-label={t('emergency.title')}
          title={t('emergency.title')}
        >
          <Shield size={18} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowBreathing(true)}
          className="w-12 h-12 rounded-2xl bg-[#161616] border border-[#1E1E1E] flex items-center justify-center text-[#888] hover:text-[#5AC8FA] transition-colors shadow-lg"
          aria-label={t('health.breathing.title')}
          title={t('health.breathing.title')}
        >
          <Wind size={18} />
        </motion.button>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {showMorning && <MorningIntervention onDismiss={() => setShowMorning(false)} />}
      </AnimatePresence>

      {showWarMode && (
        <WarModeOverlay
          duration={warModeDuration}
          onExit={() => setShowWarMode(false)}
        />
      )}

      <CravingInterrupt isOpen={showCraving} onClose={() => setShowCraving(false)} />
      <NightProtocol isOpen={showNightProtocol} onClose={() => setShowNightProtocol(false)} />
      <EmergencyOverride isOpen={showEmergency} onClose={() => setShowEmergency(false)} />
      <BreathingExercise isOpen={showBreathing} onClose={() => setShowBreathing(false)} />

      {showBlocker && <SiteBlockerOverlay onDismiss={() => setShowBlocker(false)} />}

      {/* Health Reminders */}
      <HealthReminderOverlay />

      {/* Quote Ticker */}
      <QuoteTicker />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ErrorBoundary>
  );
}
