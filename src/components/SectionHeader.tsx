import React from 'react';
import { useApp, MainTab } from '../context/AppContext';

const PAGE_META: Record<Exclude<MainTab, 'home'>, {
  eyebrow: string;
  title: string;
}> = {
  vocab: {
    eyebrow: 'VOCABULARY',
    title: '单词复习',
  },
  error: {
    eyebrow: 'CORRECTIONS',
    title: '纠错知识库',
  },
  phrase: {
    eyebrow: 'EXPRESSIONS',
    title: '地道句型',
  },
  profile: {
    eyebrow: 'MY LINGOTRACE',
    title: '我的学习空间',
  },
};

export const SectionHeader: React.FC = () => {
  const { activeTab, theme } = useApp();
  if (activeTab === 'home') return null;

  const meta = PAGE_META[activeTab];

  return (
    <header className="px-5 pt-3 pb-2.5">
      <div className="flex min-h-10 items-center gap-2.5">
        <span
          className="h-5 w-1 rounded-full"
          style={{ backgroundColor: theme.colors.c500 }}
          aria-hidden="true"
        />
        <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
          {meta.title}
        </h1>
        <span
          className="rounded-full px-2 py-0.5 text-[8px] font-bold tracking-[0.12em]"
          style={{ backgroundColor: theme.colors.c150, color: theme.colors.c900 }}
        >
          {meta.eyebrow}
        </span>
      </div>
    </header>
  );
};
