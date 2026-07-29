import React from 'react';
import { X, Sparkles, ShieldCheck, ArrowRight, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export const LoginModal: React.FC = () => {
  const { settings, theme, showLoginModal, setShowLoginModal } = useApp();
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  if (!showLoginModal) return null;

  const avatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || settings.avatar;
  const googleName = user?.user_metadata?.full_name || user?.user_metadata?.name || settings.name;

  const handleGoogle = async () => {
    setError(''); setBusy(true);
    try { await signInWithGoogle(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Google 登录失败，请稍后重试'); setBusy(false); }
  };
  const handleSignOut = async () => {
    setError(''); setBusy(true);
    try { await signOut(); setShowLoginModal(false); }
    catch (e) { setError(e instanceof Error ? e.message : '退出失败，请稍后重试'); setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl p-6 space-y-5 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20 pointer-events-none" style={{ backgroundColor: theme.primaryHex }} />
        <div className="flex justify-end relative z-10"><button onClick={() => setShowLoginModal(false)} className="p-1.5 rounded-full bg-[var(--bg-main)] text-[var(--text-secondary)]"><X className="w-5 h-5" /></button></div>

        {loading ? (
          <p className="py-12 text-center text-sm text-[var(--text-secondary)]">正在检查登录状态…</p>
        ) : user ? (
          <div className="relative z-10 text-center space-y-4">
            <img src={avatar} alt="Google 账号头像" className="w-20 h-20 mx-auto rounded-full object-cover border-2 border-emerald-500 shadow-sm" />
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700"><ShieldCheck className="w-3.5 h-3.5" />Google 账号已登录</div>
              <h2 className="mt-3 text-xl font-bold text-[var(--text-primary)]">{googleName}</h2>
              <p className="mt-1 text-xs text-[var(--text-secondary)] break-all">{user.email}</p>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">你的登录会话已保存。刷新页面后仍会保持登录。</p>
            <button onClick={handleSignOut} disabled={busy} className="w-full py-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--card-border)] text-rose-600 font-bold text-xs flex items-center justify-center gap-2"><LogOut className="w-4 h-4" />{busy ? '正在退出…' : '退出 Google 账号'}</button>
          </div>
        ) : (
          <div className="relative z-10 text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--bg-main)] border border-[var(--card-border)] flex items-center justify-center"><Sparkles className="w-7 h-7" style={{ color: theme.primaryHex }} /></div>
            <div><h2 className="text-2xl font-bold text-[var(--text-primary)]">LingoTrace</h2><p className="mt-2 text-xs text-[var(--text-secondary)]">登录后可识别你的账号，并为后续云端同步做准备</p></div>
            <button onClick={handleGoogle} disabled={busy} className="w-full py-3 px-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--card-border)] text-[var(--text-primary)] font-bold text-xs flex items-center justify-center gap-2 shadow-xs">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
              {busy ? '正在跳转…' : '使用 Google 账号登录'}
            </button>
            <button onClick={() => setShowLoginModal(false)} className="text-xs font-bold flex items-center justify-center gap-1 mx-auto" style={{ color: theme.primaryHex }}>暂时以访客身份使用<ArrowRight className="w-3.5 h-3.5" /></button>
          </div>
        )}
        {error && <p className="relative z-10 text-[11px] text-rose-600 text-center" role="alert">{error}</p>}
      </div>
    </div>
  );
};
