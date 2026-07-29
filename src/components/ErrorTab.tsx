import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GrammarErrorItem } from '../types';
import { AlertCircle, CheckCircle, Sparkles, Plus, Flame, ArrowRight, X, Trash2 } from 'lucide-react';

export const ErrorTab: React.FC = () => {
  const { errors, addError, deleteError, theme, openPracticeForError } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newError, setNewError] = useState({
    originalSentence: '',
    errorHighlight: '',
    correctedSentence: '',
    correctedHighlight: '',
    explanation: '',
    category: 'grammar' as GrammarErrorItem['category'],
    categoryLabel: '语法错误',
    occurrenceCount: 1,
    tag: '#语法'
  });

  const filteredErrors = errors.filter(e => {
    if (activeCategory === 'all') return true;
    return e.category === activeCategory;
  });

  // Calculate error category proportions
  const totalErrors = errors.reduce((acc, curr) => acc + curr.occurrenceCount, 0);
  const categoriesCount = {
    collocation: errors.filter(e => e.category === 'collocation').reduce((a, b) => a + b.occurrenceCount, 0),
    grammar: errors.filter(e => e.category === 'grammar').reduce((a, b) => a + b.occurrenceCount, 0),
    word_choice: errors.filter(e => e.category === 'word_choice').reduce((a, b) => a + b.occurrenceCount, 0),
    spelling: errors.filter(e => e.category === 'spelling').reduce((a, b) => a + b.occurrenceCount, 0)
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newError.originalSentence || !newError.correctedSentence) return;

    setIsSaving(true);
    try {
      await addError({
      ...newError,
      categoryLabel:
        newError.category === 'grammar' ? '语法错误' :
        newError.category === 'collocation' ? '固定搭配' :
        newError.category === 'word_choice' ? '用词错误' : '拼写错误'
      });

      setShowAddModal(false);
      setNewError({
      originalSentence: '',
      errorHighlight: '',
      correctedSentence: '',
      correctedHighlight: '',
      explanation: '',
      category: 'grammar',
      categoryLabel: '语法错误',
      occurrenceCount: 1,
      tag: '#语法'
      });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '保存纠错失败，请稍后重试');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* 1. Top Monthly Error Category Breakdown Chart */}
      <section className="rounded-2xl p-5 border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span>本月错误类型分布</span>
              <span className="text-[10px] font-normal text-[var(--text-secondary)] bg-[var(--bg-main)] px-2 py-0.5 rounded-full border border-[var(--card-border)]">
                ChatGPT 语法规整
              </span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              记录并收纳与 AI 对话过程中的表达偏差
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active-press"
            title="手动录入新纠错"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal Proportional Bar Chart */}
        <div className="space-y-2">
          <div className="h-2.5 w-full rounded-full bg-[var(--bg-main)] overflow-hidden flex p-0.5 border border-[var(--card-border)]/60">
            <div
              className="h-full rounded-l-full transition-all duration-500"
              style={{ width: `${(categoriesCount.collocation / totalErrors) * 100}%`, backgroundColor: theme.colors.c900 }}
              title="固定搭配"
            />
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${(categoriesCount.grammar / totalErrors) * 100}%`, backgroundColor: theme.colors.c700 }}
              title="语法错误"
            />
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${(categoriesCount.word_choice / totalErrors) * 100}%`, backgroundColor: theme.colors.c500 }}
              title="用词错误"
            />
            <div
              className="h-full rounded-r-full transition-all duration-500"
              style={{ width: `${(categoriesCount.spelling / totalErrors) * 100}%`, backgroundColor: theme.colors.c300 }}
              title="拼写错误"
            />
          </div>

          <div className="grid grid-cols-4 gap-1 text-[11px] text-[var(--text-secondary)] pt-1">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colors.c900 }} />
              <span>搭配 ({Math.round((categoriesCount.collocation / totalErrors) * 100)}%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colors.c700 }} />
              <span>语法 ({Math.round((categoriesCount.grammar / totalErrors) * 100)}%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colors.c500 }} />
              <span>用词 ({Math.round((categoriesCount.word_choice / totalErrors) * 100)}%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colors.c300 }} />
              <span>拼写 ({Math.round((categoriesCount.spelling / totalErrors) * 100)}%)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 高频错误习惯 Ranking */}
      <section className="rounded-2xl p-5 border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <Flame className="w-4 h-4" style={{ color: theme.colors.c700 }} />
            <span>高频错误习惯 Top 3</span>
          </h3>
          <button
            onClick={() => errors[0] && openPracticeForError(errors[0].id)}
            className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-0.5"
          >
            <span>一键练习</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {[
            { rank: 1, title: '介词搭配混淆 (look forward to doing)', count: 5, desc: '易忽略介词 to 后跟动名词的要求', color: theme.colors.c900 },
            { rank: 2, title: '虚拟语气表达 (If I were you, I would)', count: 4, desc: '条件从句 remained would/were 的习惯', color: theme.colors.c700 },
            { rank: 3, title: '单宾语动词人称接介词 (explain sth to sb)', count: 3, desc: '直接加双宾语的惯性语言习惯', color: theme.colors.c500 }
          ].map(habit => (
            <div
              key={habit.rank}
              className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--card-border)]/60 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  className="w-5 h-5 shrink-0 rounded-full flex items-center justify-center font-bold text-[11px] text-white"
                  style={{ backgroundColor: habit.color }}
                >
                  {habit.rank}
                </span>
                <div className="min-w-0">
                  <h4 className="font-bold text-[var(--text-primary)]">{habit.title}</h4>
                  <p className="text-[10px] text-[var(--text-secondary)]">{habit.desc}</p>
                </div>
              </div>

              <span className="flex h-8 w-12 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] text-[11px] font-bold text-[var(--text-secondary)]">
                {habit.count} 次
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Error Cards List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            纠错知识库 ({filteredErrors.length})
          </h3>

          {/* Filter Pills */}
          <div className="flex bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-0.5 text-[11px]">
            {[
              { id: 'all', label: '全部' },
              { id: 'grammar', label: '语法' },
              { id: 'collocation', label: '搭配' },
              { id: 'word_choice', label: '用词' }
            ].map(cat => {
              const isSel = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="px-2.5 py-1 rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor: isSel ? theme.colors.c300 : 'transparent',
                    color: isSel ? theme.colors.c900 : 'var(--text-secondary)',
                    fontWeight: isSel ? 'bold' : 'normal'
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          {filteredErrors.map(item => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-3 hover:border-black/20 transition-all"
            >
              {/* Header tag & count */}
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border border-black/5"
                  style={{ backgroundColor: theme.colors.c150, color: theme.colors.c900 }}
                >
                  {item.categoryLabel}{item.tag ? ` · ${item.tag}` : ''}
                </span>

                <span className="text-[10px] text-[var(--text-muted)] font-medium">
                  出现 {item.occurrenceCount} 次
                </span>
              </div>

              {/* Original sentence with subtle theme c075 highlight */}
              <div
                className="p-3 rounded-xl border space-y-1"
                style={{
                  backgroundColor: theme.colors.c075,
                  borderColor: theme.colors.c150
                }}
              >
                <div
                  className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                  style={{ color: theme.colors.c900 }}
                >
                  <AlertCircle className="w-3 h-3" />
                  <span>原句（含表达盲区）</span>
                </div>
                <p className="font-serif text-sm font-normal leading-relaxed text-[var(--text-primary)]">
                  {(!item.errorHighlight || !item.originalSentence.includes(item.errorHighlight)) ? item.originalSentence : item.originalSentence.split(item.errorHighlight).map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span
                          className="underline underline-offset-4 decoration-2 font-semibold"
                          style={{
                            color: theme.colors.c900,
                            textDecorationColor: theme.colors.c500
                          }}
                        >
                          {item.errorHighlight}
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </p>
              </div>

              {/* Corrected sentence with theme c150 highlight */}
              <div
                className="p-3 rounded-xl border border-black/5 space-y-1"
                style={{ backgroundColor: theme.colors.c150 }}
              >
                <div
                  className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                  style={{ color: theme.colors.c900 }}
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>ChatGPT 推荐修改句</span>
                </div>
                <p className="font-serif text-sm font-normal leading-relaxed text-[var(--text-primary)]">
                  {(!item.correctedHighlight || !item.correctedSentence.includes(item.correctedHighlight)) ? item.correctedSentence : item.correctedSentence.split(item.correctedHighlight).map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span
                          className="font-semibold rounded px-1.5 py-0.5 shadow-2xs"
                          style={{
                            backgroundColor: theme.colors.c300,
                            color: theme.colors.c900
                          }}
                        >
                          {item.correctedHighlight}
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </p>
              </div>

              {/* Explanation & Practice Button */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--card-border)]/60">
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed flex-1 pr-2">
                  {item.explanation}
                </p>

                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => { if (window.confirm('确定删除这条纠错吗？删除后可立即撤销。')) deleteError(item.id); }} aria-label={`删除纠错 ${item.originalSentence}`} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  <button
                    onClick={() => openPracticeForError(item.id)}
                    className="px-3 py-1.5 rounded-xl font-bold text-[11px] text-white shadow-xs transition-all active-press shrink-0 flex items-center gap-1"
                    style={{ backgroundColor: theme.primaryHex }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>生成练习</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add Error Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-2">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">录入 ChatGPT 语法纠错</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[var(--text-secondary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] font-medium mb-1">错误原句</label>
                <input
                  type="text"
                  required
                  placeholder="例如: I am looking forward to hear..."
                  value={newError.originalSentence}
                  onChange={e => setNewError({ ...newError, originalSentence: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--card-border)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-medium mb-1">修改后的正确句子</label>
                <input
                  type="text"
                  required
                  placeholder="例如: I am looking forward to hearing..."
                  value={newError.correctedSentence}
                  onChange={e => setNewError({ ...newError, correctedSentence: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--card-border)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-medium mb-1">简短语法规则解释</label>
                <input
                  type="text"
                  placeholder="例如: look forward to 中的 to 是介词..."
                  value={newError.explanation}
                  onChange={e => setNewError({ ...newError, explanation: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--card-border)] text-[var(--text-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] font-medium mb-1">错误分类</label>
                  <select
                    value={newError.category}
                    onChange={e => setNewError({ ...newError, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--card-border)] text-[var(--text-primary)]"
                  >
                    <option value="grammar">语法错误</option>
                    <option value="collocation">固定搭配</option>
                    <option value="word_choice">用词错误</option>
                    <option value="spelling">拼写错误</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] font-medium mb-1">标签</label>
                  <input
                    type="text"
                    placeholder="#介词"
                    value={newError.tag}
                    onChange={e => setNewError({ ...newError, tag: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--card-border)] text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 rounded-xl font-bold text-white transition-all shadow-xs"
                style={{ backgroundColor: theme.primaryHex }}
              >
                保存至纠错库
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
