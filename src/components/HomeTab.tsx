import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Heart,
  RefreshCw,
  Bookmark,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ThumbsUp,
  AlertCircle,
  BookOpen,
  Mic,
  Calendar
} from 'lucide-react';

export const HomeTab: React.FC = () => {
  const {
    theme,
    quotes,
    currentQuoteIndex,
    nextQuote,
    toggleQuoteFavorite,
    dailyReport,
    setShowHistoryModal,
    setShowPracticeModal,
    openDailyReportForDate,
    setActiveTab,
    todosCompleted,
    toggleTodo
  } = useApp();

  const [showAllTopics, setShowAllTopics] = useState(false);
  const [, latestReportMonth, latestReportDay] = dailyReport.dateStr.split('-').map(Number);
  const latestReportDateLabel = `${latestReportMonth} 月 ${latestReportDay} 日`;
  const [isThoughtSaved, setIsThoughtSaved] = useState(false);

  const currentQuote = quotes[currentQuoteIndex] || quotes[0];
  const displayedTopics = showAllTopics ? dailyReport.topics : dailyReport.topics.slice(0, 3);
  const hiddenTopicsCount = dailyReport.topics.length - 3;

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">
      
      {/* 1. Sync Status Bar */}
      <div className="flex items-center justify-between px-1 text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium">已导入 ChatGPT 学习记录</span>
          <span className="text-[var(--text-muted)]">· {dailyReport.syncTime}</span>
        </div>

        <button
          onClick={() => openDailyReportForDate(dailyReport.dateStr)}
          className="text-[11px] font-semibold hover:underline flex items-center gap-1"
          style={{ color: theme.colors.c700 }}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>查看日报快照</span>
        </button>
      </div>

      {/* 2. 每日英语短句卡片 */}
      <section className="relative overflow-hidden rounded-2xl p-5 border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs transition-all">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border border-black/5"
              style={{
                backgroundColor: theme.colors.c150,
                color: theme.colors.c900
              }}
            >
              {currentQuote.category} · 每日发音短句
            </span>

            <div className="flex items-center gap-1">
              <button
                id="btn-quote-favorite"
                onClick={() => toggleQuoteFavorite(currentQuote.id)}
                className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)] transition-all"
                title="收藏此句"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    currentQuote.isFavorite ? 'fill-rose-400 text-rose-400' : ''
                  }`}
                />
              </button>
              <button
                id="btn-next-quote"
                onClick={nextQuote}
                className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)] transition-all active-press"
                title="换一句"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="pt-1">
            <p className="font-serif text-lg sm:text-xl font-medium leading-relaxed text-[var(--text-primary)] italic">
              “{currentQuote.en}”
            </p>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 font-normal leading-normal">
              {currentQuote.zh}
            </p>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[var(--card-border)]/60 text-xs">
            <span className="text-[var(--text-muted)] font-serif italic">
              — {currentQuote.author}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1 opacity-80">
              <Bookmark className="w-3 h-3" />
              ChatGPT 金句库
            </span>
          </div>
        </div>
      </section>

      {/* 3. 今日学习概览 */}
      <section className="rounded-2xl p-4 sm:p-5 border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <span>今日学习概览</span>
            <span className="text-[10px] font-medium text-[var(--text-secondary)] bg-[var(--bg-main)] px-2 py-0.5 rounded-full border border-[var(--card-border)]">
              ChatGPT Live 分析
            </span>
          </h2>
          <button
            onClick={() => setShowHistoryModal(true)}
            className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-0.5 transition-colors"
          >
            <span>成长曲线</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Score Ring & Mini Dimension Progress */}
        <div className="grid grid-cols-12 gap-3 items-center">
          <div className="col-span-5 sm:col-span-4 flex flex-col items-center justify-center p-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--card-border)]/60">
            <div className="relative w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-black/5 dark:text-white/10"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  strokeWidth="3.5"
                  strokeDasharray={`${dailyReport.overallScore}, 100`}
                  strokeLinecap="round"
                  stroke={theme.colors.c700}
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                  {dailyReport.overallScore}
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] font-medium">综合评分</span>
              </div>
            </div>
            <div className="text-[10px] text-[var(--text-secondary)] mt-1.5 flex items-center gap-1">
              <Mic className="w-3 h-3 text-[var(--text-secondary)]" />
              <span>开口 {dailyReport.speakingMinutes}m / 共 {dailyReport.totalMinutes}m</span>
            </div>
          </div>

          <div className="col-span-7 sm:col-span-8 grid grid-cols-2 gap-2 text-xs">
            {[
              { label: '流利度', score: dailyReport.dimensions.fluency },
              { label: '语法', score: dailyReport.dimensions.grammar },
              { label: '词汇', score: dailyReport.dimensions.vocabulary },
              { label: '自然度', score: dailyReport.dimensions.naturalness }
            ].map(item => (
              <div key={item.label} className="p-2 rounded-xl bg-[var(--bg-main)]/60 border border-black/5 space-y-1">
                <div className="flex justify-between text-[11px] text-[var(--text-secondary)] font-medium">
                  <span>{item.label}</span>
                  <span className="font-bold text-[var(--text-primary)]">{item.score}分</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.score}%`,
                      backgroundColor: theme.colors.c700
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compact stats strip */}
        <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-[var(--card-border)]/60 text-center">
          <div className="p-1.5 rounded-xl bg-[var(--bg-main)]/60">
            <div className="text-[10px] text-[var(--text-secondary)]">探讨主题</div>
            <div className="text-xs font-bold text-[var(--text-primary)]">{dailyReport.topics.length} 个</div>
          </div>
          <div className="p-1.5 rounded-xl bg-[var(--bg-main)]/60">
            <div className="text-[10px] text-[var(--text-secondary)]">新增单词</div>
            <div className="text-xs font-bold text-[var(--text-primary)]">{dailyReport.newContentSummary.newWordsCount} 个</div>
          </div>
          <div className="p-1.5 rounded-xl bg-[var(--bg-main)]/60">
            <div className="text-[10px] text-[var(--text-secondary)]">自然表达</div>
            <div className="text-xs font-bold text-[var(--text-primary)]">{dailyReport.newContentSummary.sentencePatternsCount} 个</div>
          </div>
          <div className="p-1.5 rounded-xl bg-[var(--bg-main)]/60">
            <div className="text-[10px] text-[var(--text-secondary)]">纠正错误</div>
            <div className="text-xs font-bold text-[var(--text-primary)]">{dailyReport.newContentSummary.correctedErrorsCount} 项</div>
          </div>
        </div>
      </section>

      {/* 4. 今日学习主题 */}
      <section className="rounded-2xl p-4 border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[var(--text-secondary)]" />
            <span>今日对话主题 ({dailyReport.topics.length})</span>
          </h2>

          {hiddenTopicsCount > 0 && (
            <button
              onClick={() => setShowAllTopics(!showAllTopics)}
              className="text-xs font-medium flex items-center gap-0.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <span>{showAllTopics ? '收起' : `还有 ${hiddenTopicsCount} 个主题`}</span>
              {showAllTopics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {displayedTopics.map((topic, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-full text-xs font-medium border border-black/5"
              style={{
                backgroundColor: theme.colors.c150,
                color: theme.colors.c900
              }}
            >
              #{topic}
            </span>
          ))}
        </div>
      </section>

      {/* 5. 今日想法 */}
      {dailyReport.thought && (
        <section className="rounded-2xl p-4 border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[var(--text-secondary)]" />
              <span>今日对话想法</span>
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--bg-main)]">
              你表达的心声
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-black/5 space-y-2">
            <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)] leading-relaxed italic">
              “{dailyReport.thought.zh}”
            </p>

            {dailyReport.thought.en && (
              <p className="text-xs text-[var(--text-secondary)] font-serif italic border-t border-black/5 pt-2">
                "{dailyReport.thought.en}"
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <button
              onClick={() => setIsThoughtSaved(!isThoughtSaved)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium border border-black/5 flex items-center gap-1.5 active-press transition-all"
              style={{
                backgroundColor: isThoughtSaved ? theme.colors.c300 : theme.colors.c150,
                color: theme.colors.c900
              }}
            >
              <Heart className={`w-3.5 h-3.5 ${isThoughtSaved ? 'fill-current' : ''}`} />
              <span>{isThoughtSaved ? '已收藏到个人想法' : '收藏到个人想法'}</span>
            </button>

            <button
              onClick={() => setActiveTab('phrase')}
              className="px-3 py-1.5 rounded-xl text-xs font-medium border border-black/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-main)] transition-all"
            >
              继续用英语表达
            </button>
          </div>
        </section>
      )}

      {/* 6. 今日优势 */}
      <section className="rounded-2xl p-4 border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
          <ThumbsUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>今天做得好的地方</span>
        </h2>

        <div className="space-y-1.5">
          {dailyReport.strengths.slice(0, 3).map((item, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-[var(--bg-main)]/60 border border-black/5 flex items-start gap-2.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-[var(--text-primary)] font-medium">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 7. 需要提升 */}
      <section className="rounded-2xl p-4 border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>今天需要提升</span>
        </h2>

        <div className="space-y-2">
          {dailyReport.improvements.map(imp => (
            <div key={imp.id} className="p-3 rounded-xl bg-[var(--bg-main)]/60 border border-black/5 space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-black/5"
                  style={{ backgroundColor: theme.colors.c150, color: theme.colors.c900 }}
                >
                  {imp.category}
                </span>

                <button
                  onClick={() => setActiveTab(imp.targetTab)}
                  className="text-xs font-medium flex items-center gap-1 hover:underline"
                  style={{ color: theme.colors.c700 }}
                >
                  <span>{imp.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed">
                {imp.issue}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. 今日新学内容 */}
      <section className="rounded-2xl p-4 border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-[var(--text-secondary)]" />
          <span>今日新学内容汇总</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          {/* New Words */}
          <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-black/5 space-y-1.5 flex flex-col justify-between">
            <div>
              <div className="font-bold text-[var(--text-primary)] flex items-center justify-between">
                <span>{dailyReport.newContentSummary.newWordsCount} 个新单词</span>
                <span className="text-[10px] text-[var(--text-secondary)]">单词库</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] truncate mt-1">
                {dailyReport.newContentSummary.previewWords.join(' · ')}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('vocab')}
              className="mt-2 text-xs font-bold hover:underline flex items-center gap-1"
              style={{ color: theme.colors.c700 }}
            >
              <span>复习今日单词</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* New Phrases */}
          <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-black/5 space-y-1.5 flex flex-col justify-between">
            <div>
              <div className="font-bold text-[var(--text-primary)] flex items-center justify-between">
                <span>{dailyReport.newContentSummary.sentencePatternsCount} 个核心句型</span>
                <span className="text-[10px] text-[var(--text-secondary)]">句型库</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] truncate mt-1">
                {dailyReport.newContentSummary.previewPhrases.join(' · ')}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('phrase')}
              className="mt-2 text-xs font-bold hover:underline flex items-center gap-1"
              style={{ color: theme.colors.c700 }}
            >
              <span>查看今日句型</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Corrections */}
          <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-black/5 space-y-1.5 flex flex-col justify-between">
            <div>
              <div className="font-bold text-[var(--text-primary)] flex items-center justify-between">
                <span>{dailyReport.newContentSummary.correctedErrorsCount} 项重点纠错</span>
                <span className="text-[10px] text-[var(--text-secondary)]">纠错库</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] truncate mt-1">
                三单遗漏 · 虚拟语气 · 介词搭配
              </p>
            </div>
            <button
              onClick={() => setActiveTab('error')}
              className="mt-2 text-xs font-bold hover:underline flex items-center gap-1"
              style={{ color: theme.colors.c700 }}
            >
              <span>查看今日纠错</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>

      {/* 9. 学习效果复盘 */}
      <section
        className="p-4 rounded-2xl border border-black/5 space-y-1.5"
        style={{
          backgroundColor: theme.colors.c075,
          borderLeft: `4px solid ${theme.colors.c500}`
        }}
      >
        <div className="flex items-center gap-1.5 font-bold tracking-tight text-xs" style={{ color: theme.colors.c900 }}>
          <Sparkles className="w-4 h-4" />
          <span>ChatGPT 整体效果复盘</span>
        </div>
        <p className="text-xs text-[var(--text-primary)] leading-relaxed">
          “{dailyReport.qualitativeReview}”
        </p>
      </section>

      {/* 10. 下一次学习建议 */}
      <section className="rounded-2xl p-4 border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[var(--text-secondary)]" />
          <span>下一次学习建议</span>
        </h2>

        <div className="space-y-1.5">
          {dailyReport.nextSuggestions.map((sug, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-[var(--bg-main)]/60 border border-black/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{ backgroundColor: theme.colors.c150, color: theme.colors.c900 }}
                >
                  {idx + 1}
                </span>
                <span className="text-[var(--text-primary)] font-medium">{sug}</span>
              </div>
              <button
                onClick={() => setShowPracticeModal(true)}
                className="text-[11px] font-medium hover:underline shrink-0"
                style={{ color: theme.colors.c700 }}
              >
                去练习
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 11. 今日待办 */}
      <section className="rounded-2xl p-4 border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            今日待办任务
          </h2>
          <span className="text-xs text-[var(--text-secondary)]">
            已完成 {Object.values(todosCompleted).filter(Boolean).length} / 3
          </span>
        </div>

        <div className="space-y-2">
          {[
            {
              key: 'words',
              title: `复习 ${dailyReport.newContentSummary.newWordsCount} 个新增单词`,
              desc: '按卡片模式完成今日新词巩固',
              actionLabel: '去复习',
              onAction: () => setActiveTab('vocab')
            },
            {
              key: 'grammar',
              title: `完成 ${dailyReport.newContentSummary.correctedErrorsCount} 道语法微练`,
              desc: '针对三单和介词搭配的专项题目',
              actionLabel: '开始练习',
              onAction: () => setShowPracticeModal(true)
            },
            {
              key: 'phrases',
              title: `练习 ${dailyReport.newContentSummary.sentencePatternsCount} 个自然句型`,
              desc: '在场景中朗读与背诵句型',
              actionLabel: '去练习',
              onAction: () => setActiveTab('phrase')
            }
          ].map(item => {
            const isDone = todosCompleted[item.key];
            return (
              <div
                key={item.key}
                className={`p-3 rounded-xl border border-[var(--card-border)] bg-[var(--bg-main)]/60 flex items-center justify-between transition-all ${
                  isDone ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <button
                    onClick={() => toggleTodo(item.key)}
                    className="mt-0.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors active-press"
                  >
                    <CheckCircle2
                      className="w-4.5 h-4.5 transition-colors"
                      style={{
                        color: isDone ? theme.colors.c700 : 'var(--text-muted)'
                      }}
                    />
                  </button>
                  <div>
                    <h3 className={`text-xs font-bold ${isDone ? 'line-through text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <button
                  onClick={item.onAction}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all active-press border border-black/5 shrink-0"
                  style={{
                    backgroundColor: isDone ? 'transparent' : theme.colors.c150,
                    color: isDone ? 'var(--text-muted)' : theme.colors.c900
                  }}
                >
                  {item.actionLabel}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Button to view full report */}
      <div className="pt-1 text-center">
        <button
          onClick={() => openDailyReportForDate(dailyReport.dateStr)}
          className="w-full py-3.5 px-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] text-xs font-bold text-[var(--text-primary)] hover:border-black/20 transition-all flex items-center justify-center gap-2 active-press shadow-xs"
        >
          <Sparkles className="w-4 h-4" style={{ color: theme.colors.c700 }} />
          <span>查看最近导入：{latestReportDateLabel}学习日报</span>
          <ArrowRight className="w-4 h-4 text-[var(--text-secondary)]" />
        </button>
      </div>

    </div>
  );
};
