import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book, 
  Search, 
  Bookmark, 
  Settings as SettingsIcon, 
  Menu, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Copy,
  Share2,
  RotateCcw,
  Info,
  Star,
  History,
  ArrowRight,
  Mail,
  MessageCircle,
  Send,
  Facebook,
  ExternalLink,
  Check
} from 'lucide-react';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Hadith, AppSettings, BookGroup } from './types';
import { processHadiths, DEFAULT_SETTINGS, THEME_COLORS } from './constants';

// --- Components ---

const AnimatedIcon = ({ icon: Icon, className = "w-5 h-5", color }: { icon: any, className?: string, color?: string }) => (
  <motion.div
    animate={{ 
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0]
    }}
    transition={{ 
      duration: 4, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }}
    className={className}
    style={{ color }}
  >
    <Icon className="w-full h-full" />
  </motion.div>
);

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center text-white"
      style={{ backgroundColor: DEFAULT_SETTINGS.themeColor }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="mb-6"
      >
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl">
          <AnimatedIcon icon={Book} className="w-16 h-16" color={DEFAULT_SETTINGS.themeColor} />
        </div>
      </motion.div>
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-3xl font-bold tracking-wider"
      >
        صحیح البخاري
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 1 }}
        className="mt-2 text-sm uppercase tracking-widest"
      >
        د صحیحو احادیثو ټولګه
      </motion.p>
    </motion.div>
  );
};

const Onboarding = ({ onFinish }: { onFinish: () => void }) => {
  const [step, setStep] = useState(0);
  const slides = [
    {
      title: "صحیح البخاري ته ښه راغلاست",
      desc: "د پښتو ژباړې سره د احادیثو ترټولو معتبره ټولګه هرچیرې او هر وخت ترلاسه کړئ.",
      icon: <AnimatedIcon icon={Book} className="w-20 h-20" color={DEFAULT_SETTINGS.themeColor} />
    },
    {
      title: "۱۰۰٪ آفلاین لاسرسی",
      desc: "انټرنیټ نشته؟ کومه ستونزه نشته. ټول معلومات ستاسو په موبایل کې خوندي دي.",
      icon: <AnimatedIcon icon={Search} className="w-20 h-20" color={DEFAULT_SETTINGS.themeColor} />
    },
    {
      title: "خپله تجربه شخصي کړئ",
      desc: "فونټونه بدل کړئ، خپل خوښې احادیث په نښه کړئ او له هغه ځایه پیل کړئ چیرې چې مو پریښي وو.",
      icon: <AnimatedIcon icon={Bookmark} className="w-20 h-20" color={DEFAULT_SETTINGS.themeColor} />
    }
  ];

  const next = () => {
    if (step < slides.length - 1) setStep(step + 1);
    else onFinish();
  };

  return (
    <div className="fixed inset-0 z-40 bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          key={step}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          className="flex flex-col items-center"
        >
          <div 
            className="mb-12 p-8 rounded-full"
            style={{ backgroundColor: `${DEFAULT_SETTINGS.themeColor}15` }}
          >
            {slides[step].icon}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">{slides[step].title}</h2>
          <p className="text-slate-600 leading-relaxed">{slides[step].desc}</p>
        </motion.div>
      </div>
      
      <div className="p-8 flex items-center justify-between" dir="rtl">
        <button onClick={onFinish} className="text-slate-400 font-medium">پریښودل</button>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8' : 'w-2 bg-slate-200'}`} 
              style={{ backgroundColor: i === step ? DEFAULT_SETTINGS.themeColor : undefined }}
            />
          ))}
        </div>
        <button 
          onClick={next}
          className="text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"
          style={{ backgroundColor: DEFAULT_SETTINGS.themeColor }}
        >
          {step === slides.length - 1 ? 'پیل کول' : 'بل'}
          <AnimatedIcon icon={ArrowRight} className="w-4 h-4 rotate-180" />
        </button>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [loading, setLoading] = useState(true);
  const [allHadiths, setAllHadiths] = useState<Hadith[]>([]);
  const [books, setBooks] = useState<BookGroup[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [view, setView] = useState<'home' | 'book' | 'hadith' | 'search' | 'favorites' | 'settings' | 'about'>('home');
  const [selectedBook, setSelectedBook] = useState<BookGroup | null>(null);
  const [selectedHadith, setSelectedHadith] = useState<Hadith | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  const [lastRead, setLastRead] = useState<string | null>(() => {
    return localStorage.getItem('lastRead');
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/hadith.json');
        const data = await response.json();
        setAllHadiths(data);
        setBooks(processHadiths(data));
      } catch (error) {
        console.error('Error loading hadith data:', error);
      } finally {
        setTimeout(() => setLoading(false), 1500);
      }
    };
    fetchData();

    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
    StatusBar.setStyle({ style: Style.Light }).catch(() => {});
  }, [settings]);

  useEffect(() => {
    const backListener = CapApp.addListener('backButton', ({ canGoBack }) => {
      if (isDrawerOpen) {
        setIsDrawerOpen(false);
      } else if (view === 'hadith') {
        setView('book');
      } else if (view === 'book') {
        setView('home');
      } else if (view !== 'home') {
        setView('home');
      } else {
        setShowExitDialog(true);
      }
    });

    return () => {
      backListener.then(l => l.remove());
    };
  }, [view, isDrawerOpen]);

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleBookmark = (num: string) => {
    setBookmarks(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]);
  };

  const handleHadithClick = (h: Hadith) => {
    setSelectedHadith(h);
    setView('hadith');
    setLastRead(h.TheNum);
    localStorage.setItem('lastRead', h.TheNum);
  };

  const resetApp = () => {
    if (confirm('ایا تاسو ډاډه یاست چې غواړئ ټول تنظیمات اصلي حالت ته راوړئ؟')) {
      setSettings(DEFAULT_SETTINGS);
      setBookmarks([]);
      localStorage.removeItem('hasSeenOnboarding');
      window.location.reload();
    }
  };

  const clearBookmarks = () => {
    if (confirm('ایا ټولې نښې پاکې شي؟')) {
      setBookmarks([]);
    }
  };

  // --- Views ---

  const HomeView = () => (
    <div className="p-4 space-y-4" dir="rtl">
      <div 
        className="rounded-3xl p-6 text-white shadow-xl mb-6 relative overflow-hidden"
        style={{ backgroundColor: settings.themeColor }}
      >
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-1">السلام علیکم</h2>
          <p className="opacity-80 text-sm">د رسول الله (ص) په حکمتونو کې وګرځئ</p>
          {lastRead && (
            <button 
              onClick={() => {
                const h = allHadiths.find(x => x.TheNum === lastRead);
                if (h) handleHadithClick(h);
              }}
              className="mt-4 bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
            >
              <AnimatedIcon icon={History} className="w-4 h-4" />
              د مطالعې دوام: حدیث نمبر {lastRead}
            </button>
          )}
        </div>
        <div className="absolute -left-4 -bottom-4 w-32 h-32 opacity-10 -rotate-12">
          <AnimatedIcon icon={Book} className="w-full h-full" />
        </div>
      </div>

      <h3 className="text-lg font-bold px-1 flex items-center gap-2">
        <AnimatedIcon icon={Book} color={settings.themeColor} />
        د بخاري کتابونه
      </h3>
      
      <div className="grid gap-4">
        {books.map((book, i) => (
          <motion.div
            key={i}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setSelectedBook(book); setView('book'); }}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer"
          >
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
              style={{ backgroundColor: settings.themeColor }}
            >
              {i + 1}
            </div>
            <div className="flex-1 text-right">
              <h4 className="font-bold text-slate-800">{book.pashtoName}</h4>
              <p className="text-xs text-slate-400 font-arabic" dir="rtl">{book.name}</p>
            </div>
            <div className="text-left">
              <span 
                className="text-xs font-bold px-2 py-1 rounded-lg"
                style={{ backgroundColor: `${settings.themeColor}15`, color: settings.themeColor }}
              >
                {book.hadithCount} احادیث
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const BookDetailView = () => (
    <div className="p-4 space-y-6" dir="rtl">
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => setView('home')} 
          className="p-2 bg-white rounded-xl shadow-sm border border-slate-100"
        >
          <AnimatedIcon icon={ChevronRight} color={settings.themeColor} />
        </button>
        <div className="text-right">
          <h2 className="text-xl font-bold">{selectedBook?.pashtoName}</h2>
          <p className="text-xs text-slate-400 font-arabic" dir="rtl">{selectedBook?.name}</p>
        </div>
      </div>

      {selectedBook?.chapters.map((chapter, i) => (
        <div key={i} className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div 
              className="h-4 w-1 rounded-full" 
              style={{ backgroundColor: settings.themeColor }}
            />
            <h3 className="font-bold text-slate-700">{chapter.pashtoName}</h3>
          </div>
          <div className="grid gap-3">
            {chapter.hadiths.map((h, j) => (
              <motion.div
                key={j}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleHadithClick(h)}
                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-400">#{h.TheNum}</span>
                  <p className="text-sm text-slate-600 line-clamp-1 text-right">{h.Pashto}</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-300" />
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const HadithDetailView = () => {
    if (!selectedHadith) return null;
    const isBookmarked = bookmarks.includes(selectedHadith.TheNum);

    return (
      <div 
        className="flex flex-col h-full bg-slate-50" 
        dir="rtl"
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-white">
          <button onClick={() => setView('book')} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <AnimatedIcon icon={ChevronRight} color={settings.themeColor} />
          </button>
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: settings.themeColor }}>حدیث</span>
            <h2 className="text-sm font-bold">نمبر {selectedHadith.TheNum}</h2>
          </div>
          <button 
            onClick={() => toggleBookmark(selectedHadith.TheNum)}
            className="p-2 rounded-xl transition-colors"
            style={{ 
              backgroundColor: isBookmarked ? `${settings.themeColor}15` : 'transparent',
              color: isBookmarked ? settings.themeColor : '#94a3b8'
            }}
          >
            <AnimatedIcon icon={Bookmark} className={`w-6 h-6 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="space-y-2 text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">باب</span>
            <h3 className="text-lg font-bold" style={{ color: settings.themeColor }}>{selectedHadith.Bab_pashto}</h3>
            <p className="text-sm text-slate-400 font-arabic" dir="rtl">{selectedHadith.Bab}</p>
          </div>

          <div 
            className="font-arabic text-right leading-relaxed text-slate-800" 
            dir="rtl"
            style={{ fontSize: `${settings.arabicFontSize}px`, lineHeight: settings.lineSpacing }}
          >
            {selectedHadith.Arabics}
          </div>

          <div className="h-px bg-slate-100" />

          <div 
            className="leading-relaxed text-slate-600 text-right"
            style={{ fontSize: `${settings.pashtoFontSize}px`, lineHeight: settings.lineSpacing }}
          >
            {selectedHadith.Pashto}
          </div>
        </div>

        <div className="p-4 grid grid-cols-2 gap-4 border-t border-slate-100 bg-white">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(`${selectedHadith.Arabics}\n\n${selectedHadith.Pashto}`);
              alert('کاپي شو!');
            }}
            className="flex items-center justify-center gap-2 py-3 bg-slate-50 rounded-2xl font-bold text-slate-700"
          >
            <AnimatedIcon icon={Copy} />
            کاپي
          </button>
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `صحیح البخاري حدیث نمبر ${selectedHadith.TheNum}`,
                  text: `${selectedHadith.Arabics}\n\n${selectedHadith.Pashto}`,
                });
              }
            }}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-white shadow-lg"
            style={{ backgroundColor: settings.themeColor }}
          >
            <AnimatedIcon icon={Share2} />
            شریکول
          </button>
        </div>
      </div>
    );
  };

  const SearchView = () => {
    const [query, setQuery] = useState('');
    const results = useMemo(() => {
      if (!query.trim()) return [];
      const q = query.toLowerCase();
      return allHadiths.filter(h => 
        h.TheNum.includes(q) || 
        h.Arabics.includes(q) || 
        h.Pashto.toLowerCase().includes(q)
      ).slice(0, 20);
    }, [query]);

    return (
      <div className="p-4 space-y-4" dir="rtl">
        <div className="relative">
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <AnimatedIcon icon={Search} color="#94a3b8" />
          </div>
          <input 
            autoFocus
            type="text"
            placeholder="د نمبر، عربي یا پښتو په واسطه لټون وکړئ..."
            className="w-full bg-white border border-slate-100 rounded-2xl py-4 pr-12 pl-4 shadow-sm outline-none transition-all text-right"
            style={{ focusRing: `2px ${settings.themeColor}` }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          {results.map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleHadithClick(h)}
              className="bg-white p-4 rounded-2xl border border-slate-100 cursor-pointer text-right"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold" style={{ color: settings.themeColor }}>حدیث نمبر {h.TheNum}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{h.Book_pashto}</span>
              </div>
              <p className="text-sm text-slate-600 line-clamp-2">{h.Pashto}</p>
            </motion.div>
          ))}
          {query && results.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <AnimatedIcon icon={Search} className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>"{query}" لپاره هیڅ پایله ونه موندل شوه</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const FavoritesView = () => {
    const favoriteHadiths = allHadiths.filter(h => bookmarks.includes(h.TheNum));

    return (
      <div className="p-4 space-y-4" dir="rtl">
        <h2 className="text-2xl font-bold px-1 text-right">ستاسو نښه شوي احادیث</h2>
        {favoriteHadiths.length > 0 ? (
          <div className="grid gap-4">
            {favoriteHadiths.map((h, i) => (
              <motion.div
                key={i}
                onClick={() => handleHadithClick(h)}
                className="bg-white p-4 rounded-2xl border border-slate-100 cursor-pointer text-right"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold" style={{ color: settings.themeColor }}>حدیث نمبر {h.TheNum}</span>
                  <AnimatedIcon icon={Bookmark} color={settings.themeColor} className="w-4 h-4 fill-current" />
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">{h.Pashto}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400">
            <AnimatedIcon icon={Bookmark} className="w-16 h-16 mx-auto mb-4 opacity-10" />
            <p>تاسو تر اوسه هیڅ حدیث ندی نښه کړی.</p>
          </div>
        )}
      </div>
    );
  };

  const SettingsView = () => (
    <div className="p-4 space-y-8 pb-20" dir="rtl">
      <h2 className="text-2xl font-bold px-1 text-right">ترتیبات</h2>

      <section className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 text-right">ظاهري بڼه</h3>
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <AnimatedIcon icon={Star} />
              </div>
              <span className="font-medium">حرکتونه</span>
            </div>
            <button 
              onClick={() => setSettings(s => ({ ...s, animationsEnabled: !s.animationsEnabled }))}
              className="w-12 h-6 rounded-full transition-colors relative"
              style={{ backgroundColor: settings.animationsEnabled ? settings.themeColor : '#e2e8f0' }}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.animationsEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 text-right">د اپلیکیشن رنګونه</h3>
        <div className="bg-white rounded-3xl border border-slate-100 p-4">
          <div className="grid grid-cols-5 gap-3">
            {THEME_COLORS.map((t) => (
              <button
                key={t.color}
                onClick={() => setSettings(s => ({ ...s, themeColor: t.color }))}
                className={`aspect-square rounded-2xl flex items-center justify-center transition-all ${settings.themeColor === t.color ? 'ring-4 ring-offset-2 ring-slate-200 scale-110' : ''}`}
                style={{ backgroundColor: t.color }}
              >
                {settings.themeColor === t.color && <Check className="w-5 h-5 text-white" />}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 text-right">لیکبڼه</h3>
        <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">د عربي فونټ اندازه</span>
              <span className="font-bold" style={{ color: settings.themeColor }}>{settings.arabicFontSize}px</span>
            </div>
            <input 
              type="range" min="16" max="48" 
              value={settings.arabicFontSize}
              onChange={(e) => setSettings(s => ({ ...s, arabicFontSize: parseInt(e.target.value) }))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: settings.themeColor }}
            />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">د پښتو فونټ اندازه</span>
              <span className="font-bold" style={{ color: settings.themeColor }}>{settings.pashtoFontSize}px</span>
            </div>
            <input 
              type="range" min="12" max="32" 
              value={settings.pashtoFontSize}
              onChange={(e) => setSettings(s => ({ ...s, pashtoFontSize: parseInt(e.target.value) }))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: settings.themeColor }}
            />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">د کرښو ترمنځ فاصله</span>
              <span className="font-bold" style={{ color: settings.themeColor }}>{settings.lineSpacing}</span>
            </div>
            <input 
              type="range" min="1.2" max="2.5" step="0.1"
              value={settings.lineSpacing}
              onChange={(e) => setSettings(s => ({ ...s, lineSpacing: parseFloat(e.target.value) }))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: settings.themeColor }}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 text-right">د معلوماتو مدیریت</h3>
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
          <button 
            onClick={clearBookmarks}
            className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50"
          >
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <AnimatedIcon icon={Bookmark} />
            </div>
            <span className="font-medium text-red-600">نښې پاکول</span>
          </button>
          <button 
            onClick={resetApp}
            className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors"
          >
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <AnimatedIcon icon={RotateCcw} />
            </div>
            <span className="font-medium text-orange-600">اصلي حالت ته راګرځول</span>
          </button>
        </div>
      </section>
    </div>
  );

  const AboutView = () => (
    <div className="p-4 space-y-6 pb-20" dir="rtl">
      <div className="flex flex-col items-center text-center space-y-4 py-6">
        <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-200 overflow-hidden">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
          <Book className="w-10 h-10 text-white absolute" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">صحیح البخاري</h2>
          <p className="text-slate-400 text-sm">نسخه ۱.۰.۰</p>
        </div>
        <p className="text-slate-600 leading-relaxed max-w-xs">
          یو پرمختللی آفلاین اپلیکیشن چې د امام بخاري د صحیحو احادیثو ټولګه د پښتو ژباړې سره وړاندې کوي.
        </p>
      </div>

      <div className="space-y-4">
        {/* Developer Section */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
          <h3 className="text-emerald-600 font-bold mb-1">کاريال جوړوونکی:</h3>
          <p className="text-lg font-bold mb-4">عبیدالله غفاري</p>
          <div className="flex flex-wrap gap-2">
            <a href="mailto:example@gmail.com" className="p-2 bg-slate-50 rounded-xl text-slate-600 hover:text-emerald-600 transition-colors">
              <Mail className="w-5 h-5" />
            </a>
            <a href="https://wa.me/93700000000" className="p-2 bg-slate-50 rounded-xl text-slate-600 hover:text-emerald-600 transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
            <a href="https://t.me/ObaidullahGhaffari" className="p-2 bg-slate-50 rounded-xl text-slate-600 hover:text-emerald-600 transition-colors">
              <Send className="w-5 h-5" />
            </a>
            <a href="https://facebook.com/ObaidullahGhaffari" className="p-2 bg-slate-50 rounded-xl text-slate-600 hover:text-emerald-600 transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Contributor Section */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
          <h3 className="text-emerald-600 font-bold mb-1">مرسته کوونکی:</h3>
          <p className="text-lg font-bold mb-4">الحاج ډاکټر فريدون احرار</p>
          <div className="flex flex-wrap gap-2">
            <a href="mailto:example@gmail.com" className="p-2 bg-slate-50 rounded-xl text-slate-600 hover:text-emerald-600 transition-colors">
              <Mail className="w-5 h-5" />
            </a>
            <a href="https://wa.me/93700000000" className="p-2 bg-slate-50 rounded-xl text-slate-600 hover:text-emerald-600 transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
            <a href="https://t.me/DrFaraidoonAhrar" className="p-2 bg-slate-50 rounded-xl text-slate-600 hover:text-emerald-600 transition-colors">
              <Send className="w-5 h-5" />
            </a>
            <a href="https://facebook.com/DrFaraidoonAhrar" className="p-2 bg-slate-50 rounded-xl text-slate-600 hover:text-emerald-600 transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Publisher Section */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
          <h3 className="text-emerald-600 font-bold mb-1">نشروونکې اداره:</h3>
          <p className="text-lg font-bold mb-4">د اسلامي کاريالونو څانګه</p>
          <a href="https://t.me/IslamicAppsDept" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold">
            <Send className="w-4 h-4" />
            ټليګرام چينل
          </a>
        </div>
      </div>

      <div className="pt-6 space-y-3">
        <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-100">
          <Star className="w-5 h-5" />
          اپلیکیشن ته امتیاز ورکړئ
        </button>
        <button className="w-full py-4 bg-slate-100 rounded-2xl font-bold flex items-center justify-center gap-2">
          <Share2 className="w-5 h-5 text-emerald-600" />
          اپلیکیشن شریک کړئ
        </button>
      </div>
    </div>
  );

  // --- Render Logic ---

  if (loading) return <SplashScreen onFinish={() => setLoading(false)} />;
  if (showOnboarding) return <Onboarding onFinish={() => { setShowOnboarding(false); localStorage.setItem('hasSeenOnboarding', 'true'); }} />;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Exit Dialog */}
      <AnimatePresence>
        {showExitDialog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExitDialog(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl text-center overflow-hidden"
              dir="rtl"
            >
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Info className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">له اپلیکیشن څخه وتل</h3>
              <p className="text-slate-500 mb-8">ایا تاسو واقعیا غواړئ له اپلیکیشن څخه بهر شئ؟</p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowExitDialog(false)}
                  className="py-4 bg-slate-100 rounded-2xl font-bold text-slate-600"
                >
                  نه
                </button>
                <button 
                  onClick={() => CapApp.exitApp()}
                  className="py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200"
                >
                  هو، وځم
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-2xl flex flex-col"
              dir="rtl"
            >
              <div 
                className="p-6 text-white"
                style={{ backgroundColor: settings.themeColor }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <AnimatedIcon icon={Book} />
                  </div>
                  <button onClick={() => setIsDrawerOpen(false)} className="p-1 hover:bg-white/10 rounded-lg">
                    <AnimatedIcon icon={X} />
                  </button>
                </div>
                <h2 className="text-xl font-bold">صحیح البخاري</h2>
                <p className="text-sm opacity-70">د صحیحو احادیثو ټولګه</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {[
                  { id: 'home', icon: Book, label: 'کور' },
                  { id: 'search', icon: Search, label: 'لټون' },
                  { id: 'favorites', icon: Star, label: 'خوښ شوي' },
                  { id: 'settings', icon: SettingsIcon, label: 'ترتیبات' },
                  { id: 'about', icon: Info, label: 'د اپلیکیشن په اړه' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setView(item.id as any); setIsDrawerOpen(false); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${view === item.id ? 'font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                    style={{ 
                      backgroundColor: view === item.id ? `${settings.themeColor}15` : 'transparent',
                      color: view === item.id ? settings.themeColor : undefined
                    }}
                  >
                    <AnimatedIcon icon={item.icon} color={view === item.id ? settings.themeColor : undefined} />
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="p-6 border-t border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">د اسلامي ټیکنالوژۍ لخوا چمتو شوی</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      {view !== 'hadith' && (
        <header 
          className="sticky top-0 z-30 text-white shadow-lg p-4 flex items-center justify-between" 
          dir="rtl"
          style={{ backgroundColor: settings.themeColor }}
        >
          <button onClick={() => setIsDrawerOpen(true)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <AnimatedIcon icon={Menu} />
          </button>
          <h1 className="font-bold text-lg tracking-tight">
            {view === 'home' ? 'صحیح البخاري' : 
             view === 'search' ? 'لټون' :
             view === 'favorites' ? 'خوښ شوي' :
             view === 'settings' ? 'ترتیبات' :
             view === 'about' ? 'په اړه' : 'صحیح البخاري'}
          </h1>
          <button onClick={() => setView('search')} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <AnimatedIcon icon={Search} />
          </button>
        </header>
      )}

      {/* Content */}
      <main className="flex-1 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={view + (selectedBook?.name || '')}
            initial={settings.animationsEnabled ? { opacity: 0, x: 10 } : false}
            animate={settings.animationsEnabled ? { opacity: 1, x: 0 } : false}
            exit={settings.animationsEnabled ? { opacity: 0, x: -10 } : false}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {view === 'home' && <HomeView />}
            {view === 'book' && <BookDetailView />}
            {view === 'hadith' && <HadithDetailView />}
            {view === 'search' && <SearchView />}
            {view === 'favorites' && <FavoritesView />}
            {view === 'settings' && <SettingsView />}
            {view === 'about' && <AboutView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      {view !== 'hadith' && (
        <nav className="sticky bottom-0 z-30 bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center" dir="rtl">
          {[
            { id: 'home', icon: Book, label: 'کور' },
            { id: 'search', icon: Search, label: 'لټون' },
            { id: 'favorites', icon: Star, label: 'خوښ شوي' },
            { id: 'settings', icon: SettingsIcon, label: 'ترتیبات' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`flex flex-col items-center gap-1 transition-all ${view === item.id ? 'font-bold' : 'text-slate-400'}`}
              style={{ color: view === item.id ? settings.themeColor : undefined }}
            >
              <AnimatedIcon icon={item.icon} color={view === item.id ? settings.themeColor : undefined} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
