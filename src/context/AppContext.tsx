import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { loadLearningData } from '../services/learningData';
import { restoreDeleted, setFavorite, softDelete, type LibraryKind } from '../services/libraryActions';
import { recordPhraseReview, recordWordReview } from '../services/reviews';
import { createCorrection, createPhrase, createWord } from '../services/contentActions';
import { loadProfileSettings, saveProfileSettings } from '../services/profiles';
import {
  ThemeId,
  MorandiTheme,
  Quote,
  LearningStats,
  CalendarDayRecord,
  WordItem,
  GrammarErrorItem,
  PhrasePatternItem,
  UserSettings,
  DailyReport
} from '../types';
import {
  MORANDI_THEMES,
  INITIAL_QUOTES,
} from '../data/mockData';
import {
  GUEST_CALENDAR_RECORDS,
  GUEST_DAILY_REPORT,
  GUEST_ERRORS,
  GUEST_PHRASES,
  GUEST_TODAY_STATS,
  GUEST_USER_SETTINGS,
  GUEST_WORDS,
} from '../data/guestData';

export type MainTab = 'home' | 'vocab' | 'error' | 'phrase' | 'profile';

interface AppContextType {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  
  // Theme & User Settings
  theme: MorandiTheme;
  setThemeId: (id: ThemeId) => void;
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
  toggleDarkMode: () => void;
  
  // Quotes
  quotes: Quote[];
  currentQuoteIndex: number;
  nextQuote: () => void;
  toggleQuoteFavorite: (id: string) => void;
  
  // Stats & Daily Report
  todayStats: LearningStats;
  dailyReport: DailyReport;
  reports: DailyReport[];
  calendarRecords: CalendarDayRecord[];
  refreshLearningData: () => Promise<void>;
  
  // Vocab
  words: WordItem[];
  updateWordStatus: (id: string, status: WordItem['status']) => void;
  addWord: (word: Omit<WordItem, 'id' | 'reviewCount' | 'lastReviewed'>) => Promise<void>;
  deleteWord: (id: string) => void;
  toggleWordFavorite: (id: string) => void;
  
  // Errors
  errors: GrammarErrorItem[];
  addError: (error: Omit<GrammarErrorItem, 'id' | 'dateAdded'>) => Promise<void>;
  deleteError: (id: string) => void;
  
  // Phrases
  phrases: PhrasePatternItem[];
  togglePhraseFavorite: (id: string) => void;
  addPhrase: (phrase: Omit<PhrasePatternItem, 'id'>) => Promise<void>;
  deletePhrase: (id: string) => void;
  ratePhrase: (id: string, remembered: boolean) => void;
  
  // Navigation & Modals
  showHistoryModal: boolean;
  setShowHistoryModal: (show: boolean) => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  showPracticeModal: boolean;
  setShowPracticeModal: (show: boolean) => void;
  practiceErrorId: string | null;
  openPracticeForError: (errorId: string) => void;
  showDailyReportModal: boolean;
  setShowDailyReportModal: (show: boolean) => void;
  showReportImportModal: boolean;
  setShowReportImportModal: (show: boolean) => void;
  reportModalDate: string;
  openDailyReportForDate: (dateStr: string) => void;
  
  // Todo Completion State
  todosCompleted: Record<string, boolean>;
  toggleTodo: (key: string) => void;
  deletedNotice: string;
  undoLastDelete: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [settings, setSettings] = useState<UserSettings>(GUEST_USER_SETTINGS);
  const [quotes, setQuotes] = useState<Quote[]>(INITIAL_QUOTES);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(() => {
    const saved = Number(window.localStorage.getItem('lingotrace.quoteIndex'));
    return Number.isInteger(saved) && saved >= 0 && saved < INITIAL_QUOTES.length ? saved : 0;
  });
  const [todayStats, setTodayStats] = useState<LearningStats>(GUEST_TODAY_STATS);
  const [dailyReport, setDailyReport] = useState<DailyReport>(GUEST_DAILY_REPORT);
  const [reports, setReports] = useState<DailyReport[]>([GUEST_DAILY_REPORT]);
  const [calendarRecords, setCalendarRecords] = useState<CalendarDayRecord[]>(GUEST_CALENDAR_RECORDS);
  const [words, setWords] = useState<WordItem[]>(GUEST_WORDS);
  const [errors, setErrors] = useState<GrammarErrorItem[]>(GUEST_ERRORS);
  const [phrases, setPhrases] = useState<PhrasePatternItem[]>(GUEST_PHRASES);
  const { user } = useAuth();
  const [deletedNotice, setDeletedNotice] = useState('');
  const [lastDeleted, setLastDeleted] = useState<{ kind: LibraryKind; id: string } | null>(null);
  
  // Modals
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [practiceErrorId, setPracticeErrorId] = useState<string | null>(null);
  const [showDailyReportModal, setShowDailyReportModal] = useState(false);
  const [showReportImportModal, setShowReportImportModal] = useState(false);
  const [reportModalDate, setReportModalDate] = useState('2026-07-27');
  
  // Todos
  const [todosCompleted, setTodosCompleted] = useState<Record<string, boolean>>({
    words: false,
    grammar: false,
    phrases: false
  });

  const theme = MORANDI_THEMES[settings.themeId] || MORANDI_THEMES.sage;

  const refreshLearningData = useCallback(async () => {
    if (!user) return;
    const [snapshot, profileSettings] = await Promise.all([
      loadLearningData(user.id),
      loadProfileSettings(user.id),
    ]);
    const googleName = user.user_metadata?.full_name || user.user_metadata?.name;
    const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    setSettings(previous => ({
      ...previous,
      ...profileSettings,
      name: profileSettings.name || googleName || previous.name,
      avatar: profileSettings.avatar || googleAvatar || previous.avatar,
    }));
    setReports(snapshot.reports);
    setCalendarRecords(snapshot.calendarRecords);
    setWords(snapshot.words);
    setErrors(snapshot.errors);
    setPhrases(snapshot.phrases);
    setTodosCompleted({
      words: snapshot.completedReviewTypes.vocabulary,
      grammar: snapshot.completedReviewTypes.correction,
      phrases: snapshot.completedReviewTypes.sentence,
    });
    if (snapshot.reports[0]) {
      const report = snapshot.reports[0];
      setDailyReport(report);
      setTodayStats({
        overallScore: report.overallScore,
        vocabScore: report.dimensions.vocabulary,
        grammarScore: report.dimensions.grammar,
        expressionScore: report.dimensions.naturalness,
        reviewScore: 0,
        studyTimeMinutes: report.totalMinutes,
        reviewWordsCount: snapshot.dueReviewCount,
        newPhrasesCount: report.newContentSummary.sentencePatternsCount,
        errorsCorrectedCount: report.newContentSummary.correctedErrorsCount,
      });
      setSettings(previous => ({ ...previous, lastSyncTime: new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(report.syncTime)) }));
    } else {
      setDailyReport(GUEST_DAILY_REPORT);
      setTodayStats({
        overallScore: 0,
        vocabScore: 0,
        grammarScore: 0,
        expressionScore: 0,
        reviewScore: 0,
        studyTimeMinutes: 0,
        reviewWordsCount: snapshot.dueReviewCount,
        newPhrasesCount: 0,
        errorsCorrectedCount: 0,
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setSettings(GUEST_USER_SETTINGS);
      setTodayStats(GUEST_TODAY_STATS);
      setDailyReport(GUEST_DAILY_REPORT);
      setReports([GUEST_DAILY_REPORT]);
      setCalendarRecords(GUEST_CALENDAR_RECORDS);
      setWords(GUEST_WORDS);
      setErrors(GUEST_ERRORS);
      setPhrases(GUEST_PHRASES);
      return;
    }

    let active = true;
    refreshLearningData()
      .then(() => {
        if (!active) return;
      })
      .catch(error => {
        console.error('Unable to load learning data:', error);
      });
    return () => {
      active = false;
    };
  }, [refreshLearningData, user]);

  const openDailyReportForDate = (dateStr: string) => {
    setReportModalDate(dateStr);
    setShowDailyReportModal(true);
  };

  const openPracticeForError = (errorId: string) => {
    setPracticeErrorId(errorId);
    setShowPracticeModal(true);
  };

  // Apply root CSS variables whenever theme or dark mode changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--c900', theme.colors.c900);
    root.style.setProperty('--c700', theme.colors.c700);
    root.style.setProperty('--c500', theme.colors.c500);
    root.style.setProperty('--c300', theme.colors.c300);
    root.style.setProperty('--c150', theme.colors.c150);
    root.style.setProperty('--c075', theme.colors.c075);

    root.style.setProperty('--accent-color', theme.colors.c700);
    root.style.setProperty('--accent-light', theme.colors.c150);
    root.style.setProperty('--accent-dark', theme.colors.c900);

    if (settings.isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [theme, settings.isDarkMode]);

  const setThemeId = (id: ThemeId) => {
    setSettings(prev => ({ ...prev, themeId: id }));
    if (user) void saveProfileSettings(user.id, { themeId: id }).catch(error => console.error('Unable to save theme:', error));
  };

  const toggleDarkMode = () => {
    setSettings(prev => {
      const next = !prev.isDarkMode;
      if (user) void saveProfileSettings(user.id, { isDarkMode: next }).catch(error => console.error('Unable to save dark mode:', error));
      return { ...prev, isDarkMode: next };
    });
  };

  const updateSettings = (partial: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
    if (user) void saveProfileSettings(user.id, partial).catch(error => console.error('Unable to save settings:', error));
  };

  const nextQuote = () => {
    setCurrentQuoteIndex(prev => (prev + 1) % quotes.length);
  };

  useEffect(() => {
    window.localStorage.setItem('lingotrace.quoteIndex', String(currentQuoteIndex));
  }, [currentQuoteIndex]);

  useEffect(() => {
    if (quotes.length < 2) return;
    const timer = window.setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % quotes.length);
    }, 12000);
    return () => window.clearInterval(timer);
  }, [quotes.length]);

  const toggleQuoteFavorite = (id: string) => {
    setQuotes(prev =>
      prev.map(q => (q.id === id ? { ...q, isFavorite: !q.isFavorite } : q))
    );
  };

  const updateWordStatus = (id: string, status: WordItem['status']) => {
    const intervals: Record<WordItem['status'], number> = { forgot: 10 * 60_000, vague: 86_400_000, to_review: 3 * 86_400_000, mastered: 7 * 86_400_000 };
    setWords(prev =>
      prev.map(w => {
        if (w.id === id) {
          const newCount = w.reviewCount + 1;
          return {
            ...w,
            status,
            reviewCount: newCount,
            lastReviewed: '2026-07-27'
            ,dueAt: new Date(Date.now() + intervals[status]).toISOString()
          };
        }
        return w;
      })
    );
    void recordWordReview(id, status).catch(error => console.error('Unable to save review:', error instanceof Error ? error.message : JSON.stringify(error)));
  };

  const addWord = async (newW: Omit<WordItem, 'id' | 'reviewCount' | 'lastReviewed'>) => {
    if (!user) throw new Error('请先登录后再添加单词');
    const created = await createWord(user.id, newW);
    setWords(prev => [created, ...prev]);
  };

  const deleteWord = (id: string) => {
    setWords(prev => prev.filter(word => word.id !== id));
    void softDelete('word', id);
    setLastDeleted({ kind: 'word', id }); setDeletedNotice('单词已移入回收状态');
  };

  const toggleWordFavorite = (id: string) => setWords(previous => previous.map(word => {
    if (word.id !== id) return word;
    void setFavorite('word', id, !word.isFavorite);
    return { ...word, isFavorite: !word.isFavorite };
  }));

  const addError = async (newE: Omit<GrammarErrorItem, 'id' | 'dateAdded'>) => {
    if (!user) throw new Error('请先登录后再添加纠错');
    const created = await createCorrection(user.id, newE);
    setErrors(prev => [created, ...prev]);
  };

  const togglePhraseFavorite = (id: string) => {
    setPhrases(prev =>
      prev.map(p => { if (p.id !== id) return p; void setFavorite('phrase', id, !p.isFavorite); return { ...p, isFavorite: !p.isFavorite }; })
    );
  };

  const addPhrase = async (newP: Omit<PhrasePatternItem, 'id'>) => {
    if (!user) throw new Error('请先登录后再添加句型');
    const created = await createPhrase(user.id, newP);
    setPhrases(prev => [created, ...prev]);
  };

  const deletePhrase = (id: string) => {
    setPhrases(prev => prev.filter(phrase => phrase.id !== id));
    void softDelete('phrase', id); setLastDeleted({ kind: 'phrase', id }); setDeletedNotice('句型已移入回收状态');
  };

  const deleteError = (id: string) => {
    setErrors(previous => previous.filter(item => item.id !== id));
    void softDelete('error', id); setLastDeleted({ kind: 'error', id }); setDeletedNotice('纠错已移入回收状态');
  };

  const undoLastDelete = () => {
    if (!lastDeleted) return;
    void restoreDeleted(lastDeleted.kind, lastDeleted.id).then(refreshLearningData);
    setLastDeleted(null); setDeletedNotice('');
  };

  const ratePhrase = (id: string, remembered: boolean) => {
    const previousPhrase = phrases.find(phrase => phrase.id === id);
    setPhrases(prev => prev.map(phrase => {
      if (phrase.id !== id) return phrase;
      const change = remembered ? 1 : -1;
      return {
        ...phrase,
        masteryLevel: Math.min(5, Math.max(1, phrase.masteryLevel + change))
      };
    }));
    void recordPhraseReview(id, remembered).catch(error => {
      if (previousPhrase) {
        setPhrases(current => current.map(phrase => phrase.id === id ? previousPhrase : phrase));
      }
      console.error('Unable to save phrase review:', error instanceof Error ? error.message : JSON.stringify(error));
    });
  };

  const toggleTodo = (key: string) => {
    setTodosCompleted(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        theme,
        setThemeId,
        settings,
        updateSettings,
        toggleDarkMode,
        quotes,
        currentQuoteIndex,
        nextQuote,
        toggleQuoteFavorite,
        todayStats,
        dailyReport,
        reports,
        calendarRecords,
        refreshLearningData,
        words,
        updateWordStatus,
        addWord,
        deleteWord,
        toggleWordFavorite,
        errors,
        addError,
        deleteError,
        phrases,
        togglePhraseFavorite,
        addPhrase,
        deletePhrase,
        ratePhrase,
        showHistoryModal,
        setShowHistoryModal,
        showLoginModal,
        setShowLoginModal,
        showPracticeModal,
        setShowPracticeModal,
        practiceErrorId,
        openPracticeForError,
        showDailyReportModal,
        setShowDailyReportModal,
        showReportImportModal,
        setShowReportImportModal,
        reportModalDate,
        openDailyReportForDate,
        todosCompleted,
        toggleTodo
        ,deletedNotice,
        undoLastDelete
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
