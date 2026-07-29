import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CalendarDayRecord } from '../types';
import { X, ChevronLeft, ChevronRight, Clock, BookMarked, FileEdit, MessageSquareQuote, TrendingUp, Award, Zap, CheckCircle2 } from 'lucide-react';

export const HistoryModal: React.FC = () => {
  const { theme, calendarRecords, showHistoryModal, setShowHistoryModal, openDailyReportForDate } = useApp();
  
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-07-27');
  const [viewedMonth, setViewedMonth] = useState(() => new Date(2026, 6, 1));
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '3m' | 'all'>('30d');
  const [hoveredPoint, setHoveredPoint] = useState<CalendarDayRecord | null>(null);

  useEffect(() => {
    if (!showHistoryModal || calendarRecords.length === 0) return;
    const latest = [...calendarRecords].sort((a, b) => b.dateStr.localeCompare(a.dateStr))[0];
    setSelectedDateStr(latest.dateStr);
    const [year, month] = latest.dateStr.split('-').map(Number);
    setViewedMonth(new Date(year, month - 1, 1));
  }, [showHistoryModal, calendarRecords]);

  if (!showHistoryModal) return null;

  const selectedRecord = calendarRecords.find(r => r.dateStr === selectedDateStr);

  // Days in month grid header (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
  const viewedYear = viewedMonth.getFullYear();
  const viewedMonthIndex = viewedMonth.getMonth();
  const daysInMonth = new Date(viewedYear, viewedMonthIndex + 1, 0).getDate();
  const emptyDaysOffset = (new Date(viewedYear, viewedMonthIndex, 1).getDay() + 6) % 7;
  const monthPrefix = `${viewedYear}-${String(viewedMonthIndex + 1).padStart(2, '0')}`;
  const recordsByDate = new Map<string, CalendarDayRecord>(
    calendarRecords.map(record => [record.dateStr, record])
  );
  const today = new Date();
  const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const changeMonth = (offset: number) => {
    const nextMonth = new Date(viewedYear, viewedMonthIndex + offset, 1);
    setViewedMonth(nextMonth);
    const nextPrefix = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
    const latestRecordInMonth = [...calendarRecords]
      .filter(record => record.dateStr.startsWith(nextPrefix))
      .sort((a, b) => b.dateStr.localeCompare(a.dateStr))[0];
    setSelectedDateStr(latestRecordInMonth?.dateStr ?? `${nextPrefix}-01`);
  };

  // Filter records with data for growth curve
  const recordedDays = calendarRecords
    .filter(r => r.hasRecord)
    .sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  
  let chartRecords = recordedDays;
  if (timeFilter === '7d') {
    chartRecords = recordedDays.slice(-7);
  } else if (timeFilter === '30d') {
    chartRecords = recordedDays.slice(-30);
  }

  const averageScore = chartRecords.length
    ? Math.round(chartRecords.reduce((total, record) => total + record.score, 0) / chartRecords.length)
    : 0;
  const scoreChange = chartRecords.length > 1
    ? chartRecords[chartRecords.length - 1].score - chartRecords[0].score
    : 0;

  // Calculate SVG bezier path for smooth growth curve
  const chartHeight = 140;
  const chartWidth = 320;
  const paddingX = 20;
  const paddingY = 20;

  const minScore = 65;
  const maxScore = 95;

  const points = chartRecords.map((r, i) => {
    const x = paddingX + (i / Math.max(1, chartRecords.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - ((r.score - minScore) / (maxScore - minScore)) * (chartHeight - paddingY * 2);
    return { x, y, record: r };
  });

  // Construct SVG Path
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      pathD += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
  }

  const fillD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-md transition-all animate-fadeIn">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl p-5 space-y-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 bg-[var(--card-bg)]/95 backdrop-blur-md pt-1 pb-2 z-20 border-b border-[var(--card-border)]/60">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              学习历史与成长轨迹
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              月度打卡日历 & 综合能力曲线
            </p>
          </div>
          <button
            id="btn-close-history"
            onClick={() => setShowHistoryModal(false)}
            className="p-1.5 rounded-full bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. 月历 (Month Calendar) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[var(--text-primary)]">
              {viewedYear}年 {viewedMonthIndex + 1}月
            </span>
            <div className="flex items-center gap-1">
              <button aria-label="上个月" onClick={() => changeMonth(-1)} className="p-1 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-main)]">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button aria-label="下个月" onClick={() => changeMonth(1)} className="p-1 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-main)]">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 text-center text-[11px] font-medium text-[var(--text-muted)]">
            {weekDays.map(d => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots offset */}
            {Array.from({ length: emptyDaysOffset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }, (_, index) => index + 1).map(dayNumber => {
              const dateStr = `${monthPrefix}-${String(dayNumber).padStart(2, '0')}`;
              const record = recordsByDate.get(dateStr);
              const isSelected = dateStr === selectedDateStr;
              const isToday = dateStr === todayDateStr;

              return (
                <button
                  key={dateStr}
                  aria-label={`${dateStr}${record ? '，有学习记录' : '，无学习记录'}`}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`min-h-10 py-1 rounded-xl flex flex-col items-center justify-center transition-all relative active-press ${
                    isSelected
                      ? 'text-[var(--text-primary)] font-bold shadow-xs'
                      : record
                        ? 'text-[var(--text-primary)] hover:bg-[var(--bg-main)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-main)]'
                  } ${isToday ? 'border border-[#858A84]/50' : 'border border-transparent'}`}
                  style={{
                    backgroundColor: isSelected ? theme.colors.c150 : undefined
                  }}
                >
                  <span className="text-xs">{dayNumber}</span>

                  {/* Single Dot indicator (3-4px gap, 4.5px size, soft mid-tone color) */}
                  <div className="flex items-center justify-center mt-[3px] h-[5px]">
                    {record?.hasRecord && (
                      <span
                        className="w-[4.5px] h-[4.5px] rounded-full"
                        style={{ backgroundColor: theme.colors.c500 }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. 当天学习摘要 (Selected Day Summary Card) */}
        {selectedRecord && selectedRecord.hasRecord ? (
          <section className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--card-border)] space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-[var(--card-border)]/60 pb-2">
              <span className="font-bold text-[var(--text-primary)]">
                {selectedRecord.dateStr} 学习记录
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-black/5"
                style={{ backgroundColor: theme.colors.c150, color: theme.colors.c900 }}
              >
                综合分：{selectedRecord.score} 分
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]/60">
                <Clock className="w-3.5 h-3.5 mx-auto text-[var(--text-secondary)] opacity-80" />
                <span className="block text-xs font-bold text-[var(--text-primary)] mt-1">
                  {selectedRecord.studyMinutes} 分钟
                </span>
                <span className="text-[9px] text-[var(--text-secondary)]">时长</span>
              </div>

              <div className="p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]/60">
                <BookMarked className="w-3.5 h-3.5 mx-auto text-[var(--text-secondary)] opacity-80" />
                <span className="block text-xs font-bold text-[var(--text-primary)] mt-1">
                  {selectedRecord.reviewWords} 个
                </span>
                <span className="text-[9px] text-[var(--text-secondary)]">单词</span>
              </div>

              <div className="p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]/60">
                <FileEdit className="w-3.5 h-3.5 mx-auto text-[var(--text-secondary)] opacity-80" />
                <span className="block text-xs font-bold text-[var(--text-primary)] mt-1">
                  {selectedRecord.correctedErrors} 项
                </span>
                <span className="text-[9px] text-[var(--text-secondary)]">纠错</span>
              </div>

              <div className="p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]/60">
                <MessageSquareQuote className="w-3.5 h-3.5 mx-auto text-[var(--text-secondary)] opacity-80" />
                <span className="block text-xs font-bold text-[var(--text-primary)] mt-1">
                  {selectedRecord.newPhrases} 个
                </span>
                <span className="text-[9px] text-[var(--text-secondary)]">句型</span>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-normal pt-1 italic border-t border-[var(--card-border)]/60">
              “{selectedRecord.aiSummary}”
            </p>

            <div className="pt-1">
              <button
                onClick={() => openDailyReportForDate(selectedRecord.dateStr)}
                className="w-full py-2 rounded-xl border border-black/5 text-xs font-bold transition-all active-press flex items-center justify-center gap-1.5"
                style={{ backgroundColor: theme.colors.c150, color: theme.colors.c900 }}
              >
                <span>查看当日完整学习日报</span>
                <X className="w-3.5 h-3.5 rotate-45" />
              </button>
            </div>
          </section>
        ) : (
          <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--card-border)] text-center text-xs text-[var(--text-secondary)] py-6">
            该日期无学习记录，保持好节奏，明天继续打卡吧！
          </div>
        )}

        {/* 3. 综合分数成长曲线 (Comprehensive Score Growth Curve) */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" style={{ color: theme.colors.c700 }} />
              <span>综合分数成长曲线</span>
            </h3>

            {/* Time filters */}
            <div className="flex items-center gap-1 bg-[var(--bg-main)] p-1 rounded-xl border border-[var(--card-border)]">
              {[
                { id: '7d', label: '7天' },
                { id: '30d', label: '30天' },
                { id: '3m', label: '3个月' },
                { id: 'all', label: '全部' }
              ].map(f => {
                const isSel = timeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setTimeFilter(f.id as any)}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all"
                    style={{
                      backgroundColor: isSel ? theme.colors.c300 : 'transparent',
                      color: isSel ? theme.colors.c900 : 'var(--text-secondary)',
                      fontWeight: isSel ? 'bold' : 'normal'
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SVG Minimal Smooth Curve */}
          <div className="relative p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--card-border)] space-y-2">
            <div className="flex justify-between items-center text-xs text-[var(--text-secondary)] mb-1 font-medium">
              <span>周期平均分：<strong className="text-[var(--text-primary)]">{averageScore}分</strong></span>
              <span className={`font-bold ${scoreChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                变化 {scoreChange >= 0 ? '+' : ''}{scoreChange}分
              </span>
            </div>

            <div className="relative w-full h-[140px]">
              <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme.colors.c300} stopOpacity="0.12" />
                    <stop offset="100%" stopColor={theme.colors.c300} stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* 2-3 Extremely light horizontal reference lines */}
                <line x1={paddingX} y1={chartHeight * 0.3} x2={chartWidth - paddingX} y2={chartHeight * 0.3} stroke="#E3E0D8" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
                <line x1={paddingX} y1={chartHeight * 0.65} x2={chartWidth - paddingX} y2={chartHeight * 0.65} stroke="#E3E0D8" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />

                {/* Fill under curve */}
                {fillD && <path d={fillD} fill="url(#scoreGradient)" />}

                {/* Curve stroke */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={theme.colors.c700}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Points: Only show Selected Date point, Hovered point, or Last point! */}
                {points.map((p, idx) => {
                  const isSelected = p.record.dateStr === selectedDateStr;
                  const isHovered = hoveredPoint?.dateStr === p.record.dateStr;
                  const isLast = idx === points.length - 1;
                  const shouldShowDot = isSelected || isHovered || isLast;

                  return (
                    <g key={p.record.dateStr}>
                      {/* Invisible hit box for easy clicking */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="10"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(p.record)}
                        onClick={() => {
                          setHoveredPoint(p.record);
                          setSelectedDateStr(p.record.dateStr);
                        }}
                      />

                      {/* Visible Dot ONLY on key points */}
                      {shouldShowDot && (
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={isSelected || isHovered ? "4.5" : "3.5"}
                          fill={theme.colors.c700}
                          stroke="#FAF8F4"
                          strokeWidth="2"
                          className="transition-all cursor-pointer pointer-events-none"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Minimal Tooltip Overlay */}
              {(hoveredPoint || selectedRecord) && (
                <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-[var(--card-bg)] border border-[var(--card-border)] shadow-md rounded-full px-3 py-1 flex items-center gap-2 text-xs animate-fadeIn">
                  <span className="font-medium text-[var(--text-secondary)]">{(hoveredPoint || selectedRecord).dateStr}</span>
                  <span className="font-bold" style={{ color: theme.colors.c900 }}>
                    {(hoveredPoint || selectedRecord).score} 分
                  </span>
                </div>
              )}
            </div>

            {/* Sparse X-Axis Date Labels */}
            <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] pt-1 px-1">
              <span>{chartRecords[0]?.dateStr.slice(5) || ''}</span>
              {chartRecords.length > 5 && (
                <span>{chartRecords[Math.floor(chartRecords.length / 2)]?.dateStr.slice(5) || ''}</span>
              )}
              <span>{chartRecords[chartRecords.length - 1]?.dateStr.slice(5) || ''}</span>
            </div>
          </div>

          {/* Trend Summary Cards */}
          <div className="grid grid-cols-4 gap-2 pt-1 text-center">
            <div className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--card-border)]">
              <Award className="w-3.5 h-3.5 mx-auto text-[var(--text-secondary)] opacity-80" />
              <div className="text-xs font-bold text-[var(--text-primary)] mt-1">{averageScore}分</div>
              <div className="text-[9px] text-[var(--text-secondary)]">平均分</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--card-border)]">
              <TrendingUp className="w-3.5 h-3.5 mx-auto text-emerald-600 opacity-80" />
              <div className={`text-xs font-bold mt-1 ${scoreChange >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{scoreChange >= 0 ? '+' : ''}{scoreChange}分</div>
              <div className="text-[9px] text-[var(--text-secondary)]">周期变化</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--card-border)]">
              <Zap className="w-3.5 h-3.5 mx-auto text-amber-500 opacity-80" />
              <div className="text-xs font-bold text-[var(--text-primary)] mt-1">{recordedDays.length}天</div>
              <div className="text-[9px] text-[var(--text-secondary)]">学习记录</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--card-border)]">
              <CheckCircle2 className="w-3.5 h-3.5 mx-auto text-[var(--text-secondary)] opacity-80" />
              <div className="text-xs font-bold text-[var(--text-primary)] mt-1">{chartRecords.length}</div>
              <div className="text-[9px] text-[var(--text-secondary)]">当前样本</div>
            </div>
          </div>
        </section>

        {/* Bottom Done Button */}
        <div className="pt-2">
          <button
            onClick={() => setShowHistoryModal(false)}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs active-press"
            style={{ backgroundColor: theme.primaryHex }}
          >
            完成查看
          </button>
        </div>
      </div>
    </div>
  );
};
