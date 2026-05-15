import { useState, useEffect, useCallback } from 'react';
import i18n from '@/i18n';

interface Quote {
  text: string;
  author: string;
  category: string;
}

const QUOTES_EN: Quote[] = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "focus" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", category: "persistence" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs", category: "identity" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "focus" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "persistence" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss", category: "focus" },
  { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee", category: "focus" },
  { text: "Social media is the junk food of the mind.", author: "Naval Ravikant", category: "social media dangers" },
  { text: "You will never reach your destination if you stop and throw stones at every dog that barks.", author: "Winston Churchill", category: "focus" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln", category: "single goal" },
  { text: "The difference between successful people and very successful people is that very successful people say 'no' to almost everything.", author: "Warren Buffett", category: "single goal" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso", category: "focus" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma", category: "persistence" },
  { text: "You are what you repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle", category: "identity" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "FDR", category: "persistence" },
  { text: "Winners are not people who never fail, but people who never quit.", author: "Edwin Louis Cole", category: "persistence" },
  { text: "Be so good they can't ignore you.", author: "Steve Martin", category: "single goal" },
  { text: "Where focus goes, energy flows.", author: "Tony Robbins", category: "focus" },
  { text: "Every master was once a disaster.", author: "T. Harv Eker", category: "persistence" },
  { text: "Stop scrolling. Start building.", author: "FocusOS", category: "social media dangers" },
  { text: "Your phone is not your friend when it comes to your dreams.", author: "FocusOS", category: "social media dangers" },
  { text: "One hour of focused work beats three hours of distracted work.", author: "Cal Newport", category: "focus" },
  { text: "What you feed your mind determines your life's appetite.", author: "FocusOS", category: "identity" },
  { text: "Notifications are other people's priorities, not yours.", author: "FocusOS", category: "social media dangers" },
  { text: "The person you will be in 5 years is shaped by what you do today.", author: "FocusOS", category: "identity" },
];

const QUOTES_AR: Quote[] = [
  { text: "الطريقة الوحيدة للقيام بعمل عظيم هي أن تحب ما تفعله.", author: "ستيف جوبز", category: "focus" },
  { text: "لا يهم مدى بطئك طالما أنك لا تتوقف.", author: "كونفوشيوس", category: "persistence" },
  { text: "وقتك محدود، لا تضيعه في عيش حياة شخص آخر.", author: "ستيف جوبز", category: "identity" },
  { text: "سر التقدم هو البدء.", author: "مارك توين", category: "focus" },
  { text: "ركز على أن تكون منتجًا بدلاً من مشغول.", author: "تيم فيريس", category: "focus" },
  { text: "المحارب الناجح هو الرجل العادي بتركيز كالليزر.", author: "بروس لي", category: "focus" },
  { text: "وسائل التواصل الاجتماعي هي الوجبات السريعة للعقل.", author: "نافال رافيكانت", category: "social media dangers" },
  { text: "الانضباط هو الاختيار بين ما تريده الآن وما تريده أكثر.", author: "أبراهام لينكولن", category: "single goal" },
  { text: "أنت ما تفعله بشكل متكرر. التميز ليس فعلاً، بل عادة.", author: "أرسطو", category: "identity" },
  { text: "توقف عن التمرير. ابدأ بالبناء.", author: "FocusOS", category: "social media dangers" },
  { text: "هاتفك ليس صديقك عندما يتعلق الأمر بأحلامك.", author: "FocusOS", category: "social media dangers" },
  { text: "ساعة واحدة من العمل المركز تتفوق على ثلاث ساعات من العمل المشتت.", author: "كال نيوبورت", category: "focus" },
  { text: "الشخص الذي ستكونه بعد 5 سنوات يتشكل بما تفعله اليوم.", author: "FocusOS", category: "identity" },
];

const QUOTES_DE: Quote[] = [
  { text: "Der einzige Weg, großartige Arbeit zu leisten, ist zu lieben, was man tut.", author: "Steve Jobs", category: "focus" },
  { text: "Es ist egal, wie langsam du gehst, solange du nicht stehen bleibst.", author: "Konfuzius", category: "persistence" },
  { text: "Deine Zeit ist begrenzt, verschwende sie nicht damit, das Leben anderer zu leben.", author: "Steve Jobs", category: "identity" },
  { text: "Das Geheimnis des Vorankommens ist anzufangen.", author: "Mark Twain", category: "focus" },
  { text: "Konzentriere dich darauf, produktiv zu sein, nicht beschäftigt.", author: "Tim Ferriss", category: "focus" },
  { text: "Social Media ist das Fast Food des Geistes.", author: "Naval Ravikant", category: "social media dangers" },
  { text: "Disziplin bedeutet, zwischen dem zu wählen, was du jetzt willst und was du am meisten willst.", author: "Abraham Lincoln", category: "single goal" },
  { text: "Du bist, was du wiederholt tust. Exzellenz ist keine Handlung, sondern eine Gewohnheit.", author: "Aristoteles", category: "identity" },
  { text: "Hör auf zu scrollen. Fang an aufzubauen.", author: "FocusOS", category: "social media dangers" },
  { text: "Eine Stunde fokussierter Arbeit schlägt drei Stunden abgelenkter Arbeit.", author: "Cal Newport", category: "focus" },
  { text: "Die Person, die du in 5 Jahren sein wirst, wird durch das geprägt, was du heute tust.", author: "FocusOS", category: "identity" },
];

const ALL_QUOTES: Record<string, Quote[]> = {
  en: QUOTES_EN,
  ar: QUOTES_AR,
  de: QUOTES_DE,
};

const isValidQuote = (q: unknown): q is Quote => {
  return (
    typeof q === 'object' &&
    q !== null &&
    typeof (q as Quote).text === 'string' &&
    typeof (q as Quote).author === 'string' &&
    typeof (q as Quote).category === 'string'
  );
};

const loadFavorites = (): Quote[] => {
  try {
    const saved = localStorage.getItem('focusos-fav-quotes');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidQuote);
  } catch {
    return [];
  }
};

const saveFavorites = (favorites: Quote[]): void => {
  try {
    localStorage.setItem('focusos-fav-quotes', JSON.stringify(favorites));
  } catch {
    // Storage not available, ignore
  }
};

export function useMotivationQuotes(intervalMs = 180000) {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [favorites, setFavorites] = useState<Quote[]>(loadFavorites);
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');

  const getRandomQuote = useCallback(() => {
    const lang = currentLang;
    const quotes = ALL_QUOTES[lang] || ALL_QUOTES.en;
    const idx = Math.floor(Math.random() * quotes.length);
    return quotes[idx];
  }, [currentLang]);

  // Subscribe to language changes
  useEffect(() => {
    const handleLangChange = (lang: string) => {
      setCurrentLang(lang);
    };
    i18n.on('languageChanged', handleLangChange);
    return () => {
      i18n.off('languageChanged', handleLangChange);
    };
  }, []);

  // Update quote when language changes or on interval
  useEffect(() => {
    setCurrentQuote(getRandomQuote());
    const timer = setInterval(() => {
      setCurrentQuote(getRandomQuote());
    }, intervalMs);
    return () => clearInterval(timer);
  }, [getRandomQuote, intervalMs]);

  const toggleFavorite = useCallback((quote: Quote) => {
    setFavorites((prev) => {
      const exists = prev.some((q) => q.text === quote.text);
      const next = exists ? prev.filter((q) => q.text !== quote.text) : [...prev, quote];
      saveFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((quote: Quote) => {
    return favorites.some((q) => q.text === quote.text);
  }, [favorites]);

  return { currentQuote, favorites, toggleFavorite, isFavorite, getRandomQuote };
}
