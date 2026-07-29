import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopHeader } from './components/TopHeader';
import { SectionHeader } from './components/SectionHeader';
import { Navbar } from './components/Navbar';
import { HomeTab } from './components/HomeTab';
import { WordTab } from './components/WordTab';
import { ErrorTab } from './components/ErrorTab';
import { PhraseTab } from './components/PhraseTab';
import { ProfileTab } from './components/ProfileTab';
import { HistoryModal } from './components/HistoryModal';
import { LoginModal } from './components/LoginModal';
import { PracticeModal } from './components/PracticeModal';
import { DailyReportModal } from './components/DailyReportModal';
import { ReportImportModal } from './components/ReportImportModal';
import { Smartphone, Monitor } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';

const MainContainer: React.FC = () => {
  const { activeTab, deletedNotice, undoLastDelete } = useApp();
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  return (
    <div className="min-h-screen bg-[#ECE8DF] dark:bg-[#121312] transition-colors flex flex-col items-center justify-start p-0 sm:p-4 md:p-6 font-sans">
      {/* Top frame view mode selector bar for desktop viewports */}
      <div className="hidden sm:flex items-center gap-2 mb-3 bg-[var(--card-bg)] px-3 py-1.5 rounded-full border border-[var(--card-border)] shadow-xs text-xs">
        <span className="text-[var(--text-secondary)] font-medium">界面预览视图:</span>
        <button
          onClick={() => setIsPhoneFrame(true)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
            isPhoneFrame
              ? 'bg-[var(--bg-main)] text-[var(--text-primary)] shadow-xs border border-[var(--card-border)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>iPhone 15 Pro 框</span>
        </button>
        <button
          onClick={() => setIsPhoneFrame(false)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
            !isPhoneFrame
              ? 'bg-[var(--bg-main)] text-[var(--text-primary)] shadow-xs border border-[var(--card-border)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>铺满全屏</span>
        </button>
      </div>

      {/* Main App Container */}
      <div
        className={`w-full transition-all duration-300 relative bg-[var(--bg-main)] text-[var(--text-primary)] ${
          isPhoneFrame
            ? 'max-w-md min-h-[850px] sm:min-h-[880px] sm:rounded-[48px] border-0 sm:border-[8px] border-[#2B2D2A] dark:border-[#383B37] shadow-2xl overflow-hidden'
            : 'max-w-xl min-h-screen sm:min-h-[90vh] sm:rounded-3xl border border-[var(--card-border)] shadow-xl overflow-hidden'
        }`}
      >
        {/* Dynamic Island Mockup on iPhone frame */}
        {isPhoneFrame && (
          <div className="hidden sm:flex justify-center pt-2.5 pb-1 relative z-50">
            <div className="w-28 h-6 bg-black rounded-full flex items-center justify-end px-2 gap-1.5 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
              <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
            </div>
          </div>
        )}

        {/* Top Header */}
        {activeTab === 'home' && <TopHeader />}
        {activeTab !== 'home' && <SectionHeader />}

        {/* Main Content View with Smooth Transition */}
        <main className="px-4 pt-1 pb-16">
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'vocab' && <WordTab />}
          {activeTab === 'error' && <ErrorTab />}
          {activeTab === 'phrase' && <PhraseTab />}
          {activeTab === 'profile' && <ProfileTab />}
        </main>

        {/* Floating Modals */}
        <HistoryModal />
        <LoginModal />
        <PracticeModal />
        <DailyReportModal />
        <ReportImportModal />
        {deletedNotice && <div role="status" className="absolute bottom-20 left-4 right-4 z-40 flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-xs text-white shadow-xl"><span>{deletedNotice}</span><button onClick={undoLastDelete} className="font-bold text-emerald-300">撤销</button></div>}

        {/* Bottom Navigation */}
        <Navbar />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainContainer />
      </AppProvider>
    </AuthProvider>
  );
}
