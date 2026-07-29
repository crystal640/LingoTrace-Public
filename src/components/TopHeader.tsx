import React from 'react';
import { Calendar, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export const TopHeader: React.FC = () => {
  const { settings, theme, setShowHistoryModal, setShowLoginModal } = useApp();
  const { user, loading } = useAuth();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const dateLabel = new Intl.DateTimeFormat('zh-CN', {
    month: 'long', day: 'numeric', weekday: 'long'
  }).format(now);
  const accountAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || settings.avatar;
  const accountTitle = loading ? '正在检查登录状态' : user ? 'Google 账号已登录，点击查看' : '当前为访客模式，点击登录';

  return (
    <header className="pt-4 pb-3 px-5 flex items-center justify-between sticky top-0 z-30 bg-[var(--bg-main)]/90 backdrop-blur-md transition-all">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium tracking-wide">
          <Calendar className="w-3.5 h-3.5 opacity-70" />
          <span>{dateLabel}</span>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ml-1 ${user ? 'bg-emerald-500' : 'bg-black/20'}`} title={accountTitle} />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] mt-0.5">
          {greeting}, {settings.name}.
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button id="btn-open-history" onClick={() => setShowHistoryModal(true)} className="p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active-press shadow-xs flex items-center gap-1 text-xs" title="查看学习历史与月历">
          <Sparkles className="w-4 h-4" style={{ color: theme.colors.c700 }} />
          <span className="font-medium hidden sm:inline">月历</span>
        </button>

        <button id="btn-user-avatar" onClick={() => setShowLoginModal(true)} className="relative group active-press" title={accountTitle}>
          <img src={accountAvatar} alt={user ? 'Google 账号头像' : settings.name} className="w-10 h-10 rounded-full object-cover border-2 shadow-xs transition-transform group-hover:scale-105" style={{ borderColor: theme.colors.c700 }} />
          <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-[var(--bg-main)] rounded-full ${user ? 'bg-emerald-500' : 'bg-black/25'}`} />
        </button>
      </div>
    </header>
  );
};
