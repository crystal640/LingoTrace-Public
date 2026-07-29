import React from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Sparkles,
  Clock,
  Mic,
  MessageSquare,
  ThumbsUp,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Calendar,
  Layers,
  Award
} from 'lucide-react';

export const DailyReportModal: React.FC = () => {
  const {
    showDailyReportModal,
    setShowDailyReportModal,
    reportModalDate,
    dailyReport,
    reports,
    theme,
    setActiveTab
  } = useApp();

  if (!showDailyReportModal) return null;

  const selectedReport = reports.find(item => item.dateStr === reportModalDate);
  const hasReport = Boolean(selectedReport);
  const report = selectedReport ?? {
    ...dailyReport,
    dateStr: reportModalDate
  };

  const handleNavigate = (tab: 'vocab' | 'error' | 'phrase') => {
    setShowDailyReportModal(false);
    setActiveTab(tab);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[var(--text-primary)]">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-[var(--card-border)] flex items-center justify-between bg-[var(--bg-main)]/60">
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: theme.colors.c150, color: theme.colors.c900 }}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
                <span>{report.dateStr} 英语学习日报</span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{hasReport ? `ChatGPT 对话导入记录 (${report.syncTime})` : '该日期暂无完整日报'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowDailyReportModal(false)}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] transition-all"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm leading-relaxed">

          {!hasReport ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--bg-main)] px-6 text-center">
              <Calendar className="mb-3 h-8 w-8 text-[var(--text-muted)]" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">暂无完整学习日报</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                这一天目前只有日历概览数据，还没有导入对应的 ChatGPT 对话记录。
              </p>
            </div>
          ) : (
          <>

          {/* Key Stat Badges Banner */}
          <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--card-border)]">
            <div className="flex flex-col items-center text-center p-1">
              <span className="text-[10px] text-[var(--text-secondary)] font-medium">综合评分</span>
              <span className="text-xl sm:text-2xl font-bold tracking-tight mt-0.5" style={{ color: theme.colors.c900 }}>
                {report.overallScore}<span className="text-xs font-normal text-[var(--text-secondary)]">分</span>
              </span>
            </div>

            <div className="flex flex-col items-center text-center p-1 border-x border-[var(--card-border)]">
              <span className="text-[10px] text-[var(--text-secondary)] font-medium flex items-center gap-1">
                <Mic className="w-3 h-3 text-[var(--text-secondary)]" /> 实际开口
              </span>
              <span className="text-xl sm:text-2xl font-bold tracking-tight mt-0.5">
                {report.speakingMinutes}<span className="text-xs font-normal text-[var(--text-secondary)]">分钟</span>
              </span>
            </div>

            <div className="flex flex-col items-center text-center p-1">
              <span className="text-[10px] text-[var(--text-secondary)] font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-[var(--text-secondary)]" /> 总共学习
              </span>
              <span className="text-xl sm:text-2xl font-bold tracking-tight mt-0.5">
                {report.totalMinutes}<span className="text-xs font-normal text-[var(--text-secondary)]">分钟</span>
              </span>
            </div>
          </div>

          {/* Dimension Capabilities */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[var(--text-secondary)]" />
              <span>五维能力表现</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { label: '流利度', score: report.dimensions.fluency },
                { label: '语法', score: report.dimensions.grammar },
                { label: '词汇', score: report.dimensions.vocabulary },
                { label: '自然度', score: report.dimensions.naturalness },
                { label: '沟通', score: report.dimensions.communication }
              ].map(d => (
                <div key={d.label} className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-black/5 text-center space-y-1">
                  <div className="text-[10px] text-[var(--text-secondary)]">{d.label}</div>
                  <div className="text-base font-bold text-[var(--text-primary)]">{d.score}</div>
                  <div className="w-full bg-black/10 dark:bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${d.score}%`, backgroundColor: theme.colors.c700 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Conversation Topics */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[var(--text-secondary)]" />
              <span>今日对话探讨主题 ({report.topics.length} 个)</span>
            </h3>

            <div className="flex flex-wrap gap-1.5">
              {report.topics.map((tp, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs font-medium border border-black/5"
                  style={{ backgroundColor: theme.colors.c150, color: theme.colors.c900 }}
                >
                  #{tp}
                </span>
              ))}
            </div>
          </div>

          {/* Today's Personal Thought */}
          {report.thought && (
            <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-black/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span>今日对话闪光想法</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10">ChatGPT 摘录</span>
              </div>
              <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed italic">
                “{report.thought.zh}”
              </p>
              {report.thought.en && (
                <p className="text-xs text-[var(--text-secondary)] font-serif italic border-t border-black/5 pt-2">
                  "{report.thought.en}"
                </p>
              )}
            </div>
          )}

          {/* Today's Strengths */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
              <ThumbsUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>今日表现亮眼之处</span>
            </h3>

            <div className="space-y-2">
              {report.strengths.map((str, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--bg-main)] border border-black/5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-[var(--text-primary)] font-medium">{str}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Areas to Improve */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>重点提升与练习方向</span>
            </h3>

            <div className="space-y-2">
              {report.improvements.map(imp => (
                <div key={imp.id} className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-black/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-black/5"
                      style={{ backgroundColor: theme.colors.c150, color: theme.colors.c900 }}
                    >
                      {imp.category}
                    </span>
                    <button
                      onClick={() => handleNavigate(imp.targetTab)}
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
          </div>

          {/* Qualitative Feedback */}
          <div
            className="p-4 rounded-2xl border border-black/5 space-y-1.5"
            style={{ backgroundColor: theme.colors.c075, borderLeft: `4px solid ${theme.colors.c500}` }}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs" style={{ color: theme.colors.c900 }}>
              <Sparkles className="w-4 h-4" />
              <span>ChatGPT 综合效果复盘</span>
            </div>
            <p className="text-xs text-[var(--text-primary)] leading-relaxed">
              {report.qualitativeReview}
            </p>
          </div>

          {/* Most Worth Memorizing */}
          {report.memorizingSentences.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span>Most Worth Memorizing</span>
                </h3>
                <span className="text-[10px] text-[var(--text-secondary)]">
                  {report.memorizingSentences.length} Sentences
                </span>
              </div>

              <div className="space-y-2">
                {report.memorizingSentences.map((sentence, idx) => (
                  <div key={sentence.id} className="rounded-xl border border-black/5 bg-[var(--bg-main)] p-3">
                    <div className="flex items-start gap-2.5">
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                        style={{ backgroundColor: theme.colors.c150, color: theme.colors.c900 }}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-semibold leading-relaxed text-[var(--text-primary)]">
                          {sentence.pattern}
                        </p>
                        <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                          {sentence.meaningZh}
                        </p>
                        {sentence.exampleEn && sentence.exampleEn !== sentence.pattern && (
                          <p className="border-l-2 pl-2 text-xs italic leading-relaxed text-[var(--text-secondary)]" style={{ borderColor: theme.colors.c300 }}>
                            {sentence.exampleEn}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleNavigate('phrase')}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--card-border)] bg-[var(--bg-main)] py-2.5 text-xs font-bold"
                style={{ color: theme.colors.c700 }}
              >
                <span>进入句型库复习</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Next Suggestions */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[var(--text-secondary)]" />
              <span>下一次对话建议</span>
            </h3>

            <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-black/5 space-y-2">
              {report.nextSuggestions.map((sug, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ backgroundColor: theme.colors.c150, color: theme.colors.c900 }}>
                    {idx + 1}
                  </span>
                  <span>{sug}</span>
                </div>
              ))}
            </div>
          </div>

          </>
          )}

        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[var(--card-border)] bg-[var(--bg-main)]/80 flex items-center justify-between gap-3">
          <div className="text-xs text-[var(--text-secondary)]">
            {hasReport ? '当前记录已载入 LingoTrace 开发版' : '等待导入对应日期的学习记录'}
          </div>
          <button
            onClick={() => setShowDailyReportModal(false)}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs active-press transition-all"
            style={{ backgroundColor: theme.colors.c700 }}
          >
            完成阅读
          </button>
        </div>

      </div>
    </div>
  );
};
