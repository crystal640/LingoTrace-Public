import React from 'react';
import { useApp, MainTab } from '../context/AppContext';
import { Home, BookMarked, CheckCircle2, MessageSquareQuote, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, theme } = useApp();

  const navItems: { id: MainTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: '首页', icon: Home },
    { id: 'vocab', label: '单词', icon: BookMarked },
    { id: 'error', label: '纠错', icon: CheckCircle2 },
    { id: 'phrase', label: '句型', icon: MessageSquareQuote },
    { id: 'profile', label: '我的', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto glass-nav px-3 py-2 transition-all">
      <div className="flex items-center justify-around relative">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 active-press relative ${
                isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {isActive && (
                <span
                  className="absolute inset-0 rounded-2xl transition-all"
                  style={{ backgroundColor: theme.colors.c150 }}
                />
              )}
              
              <Icon
                className={`w-5 h-5 mb-0.5 transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'scale-100 opacity-80'
                }`}
                style={{ color: isActive ? theme.colors.c700 : undefined }}
              />

              <span
                className={`text-[11px] font-medium tracking-tight ${
                  isActive ? 'font-bold' : 'opacity-70'
                }`}
                style={{ color: isActive ? theme.colors.c700 : undefined }}
              >
                {item.label}
              </span>

              {/* Minimal Apple-style indicator dot using 900 scale */}
              {isActive && (
                <span
                  className="w-1.5 h-1.5 rounded-full absolute -bottom-0.5"
                  style={{ backgroundColor: theme.colors.c900 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
