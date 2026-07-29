import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WordItem } from '../types';
import { Volume2, RotateCw, Plus, Search, CheckCircle, Sparkles, Filter, Bookmark, ArrowRight, X, Trash2, Heart } from 'lucide-react';

export const WordTab: React.FC = () => {
  const { words, updateWordStatus, addWord, deleteWord, toggleWordFavorite, theme } = useApp();

  const handleDeleteWord = (id: string, word: string) => {
    if (window.confirm(`确定要删除单词“${word}”吗？删除后可立即撤销。`)) {
      deleteWord(id);
    }
  };

  const [isReviewMode, setIsReviewMode] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal for adding a word
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newWordData, setNewWordData] = useState({
    word: '',
    ipa: '',
    pos: 'n.',
    meaning: '',
    exampleEn: '',
    exampleZh: '',
    collocation: '',
    sourceDialogue: 'ChatGPT 对话背词',
    tags: ['ChatGPT积累'],
    status: 'to_review' as WordItem['status']
  });

  const reviewQueue = words.filter(w => !w.dueAt || new Date(w.dueAt).getTime() <= Date.now());
  const currentCard = reviewQueue[currentReviewIndex] || reviewQueue[0] || words[0];

  const filteredWords = words.filter(w => {
    const matchesSearch =
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.meaning.includes(searchQuery) ||
      w.tags.some(t => t.includes(searchQuery));

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && w.status === filterStatus;
  });

  // Audio simulation
  const handlePlayAudio = (wordText: string) => {
    setIsPlayingAudio(true);
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(wordText);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
    setTimeout(() => setIsPlayingAudio(false), 1000);
  };

  const handleRateCard = (status: WordItem['status']) => {
    if (!currentCard) return;
    updateWordStatus(currentCard.id, status);
    setIsFlipped(false);

    if (currentReviewIndex < reviewQueue.length - 1) {
      setCurrentReviewIndex(prev => prev + 1);
    } else {
      // Completed queue
      setIsReviewMode(false);
      setCurrentReviewIndex(0);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWordData.word || !newWordData.meaning) return;
    setIsSaving(true);
    try {
      await addWord(newWordData);
      setShowAddModal(false);
      setNewWordData({
      word: '',
      ipa: '',
      pos: 'n.',
      meaning: '',
      exampleEn: '',
      exampleZh: '',
      collocation: '',
      sourceDialogue: 'ChatGPT 对话背词',
      tags: ['ChatGPT积累'],
      status: 'to_review'
      });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '保存单词失败，请稍后重试');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* 1. Review Overview Header */}
      {!isReviewMode ? (
        <section className="rounded-2xl p-5 border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>单词艾宾浩斯复习</span>
                <span className="text-[10px] font-normal text-[var(--text-secondary)] bg-[var(--bg-main)] px-2 py-0.5 rounded-full border border-[var(--card-border)]">
                  ChatGPT 智能调度
                </span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                根据记忆遗忘曲线自动推荐今日待复习词汇
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active-press"
              title="添加自定义单词"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--card-border)]/60">
            <div className="space-y-1">
              <span className="text-xs text-[var(--text-secondary)]">今日待复习</span>
              <div className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                {reviewQueue.length} <span className="text-xs font-normal text-[var(--text-secondary)]">/ {words.length} 个词库总量</span>
              </div>
            </div>

            <button
              id="btn-start-review"
              onClick={() => {
                setIsReviewMode(true);
                setCurrentReviewIndex(0);
                setIsFlipped(false);
              }}
              disabled={reviewQueue.length === 0}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-xs transition-all active-press flex items-center gap-2"
              style={{
                backgroundColor: reviewQueue.length > 0 ? theme.primaryHex : 'var(--text-muted)'
              }}
            >
              <Sparkles className="w-4 h-4" />
              <span>开始复习</span>
            </button>
          </div>
        </section>
      ) : (
        /* 2. Interactive Flashcard Review Mode */
        <section className="space-y-4 animate-fadeIn">
          {/* Header bar */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => setIsReviewMode(false)}
              className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              <span>退出复习</span>
            </button>
            <span className="text-xs font-bold text-[var(--text-secondary)]">
              {currentReviewIndex + 1} / {reviewQueue.length}
            </span>
          </div>

          {/* 3D Flip Card Container */}
          {currentCard && (
            <div
              className="perspective-1000 w-full min-h-[340px] cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div
                className={`relative w-full min-h-[340px] rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-md p-6 flex flex-col justify-between transition-transform duration-500 transform-style-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front Side */}
                <div className="backface-hidden space-y-4 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-[var(--bg-main)] text-[var(--text-secondary)] border border-[var(--card-border)]">
                      {currentCard.pos} · {currentCard.tags.join(', ')}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayAudio(currentCard.word);
                      }}
                      className={`p-2 rounded-full bg-[var(--bg-main)] text-[var(--text-primary)] hover:scale-105 transition-transform ${
                        isPlayingAudio ? 'animate-pulse' : ''
                      }`}
                    >
                      <Volume2 className="w-5 h-5" style={{ color: theme.primaryHex }} />
                    </button>
                  </div>

                  <div className="text-center my-auto space-y-2 py-6">
                    <h3 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                      {currentCard.word}
                    </h3>
                    <p className="text-sm font-serif-quote italic text-[var(--text-secondary)]">
                      {currentCard.ipa}
                    </p>
                  </div>

                  <div className="text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-1 pt-2 border-t border-[var(--card-border)]/60">
                    <RotateCw className="w-3.5 h-3.5 opacity-60" />
                    <span>点击卡片翻转查看详细释义与语境</span>
                  </div>
                </div>

                {/* Back Side (Rotated 180 deg) */}
                <div className="absolute inset-0 p-6 backface-hidden rotate-y-180 rounded-3xl bg-[var(--card-bg)] flex flex-col justify-between space-y-3 overflow-y-auto">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[var(--card-border)]/60 pb-2">
                      <span className="text-lg font-bold text-[var(--text-primary)]">
                        {currentCard.word}
                      </span>
                      <span className="text-xs font-semibold text-[var(--text-secondary)]">
                        {currentCard.pos}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)] leading-snug">
                        {currentCard.meaning}
                      </p>
                      {currentCard.collocation && (
                        <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">
                          常用搭配：<span className="text-[var(--text-primary)]">{currentCard.collocation}</span>
                        </p>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--card-border)] space-y-1">
                      <p className="font-serif text-sm font-normal leading-relaxed text-[var(--text-primary)]">
                        “{currentCard.exampleEn}”
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                        {currentCard.exampleZh}
                      </p>
                    </div>

                    <p className="text-[10px] text-[var(--text-muted)] italic">
                      {currentCard.sourceDialogue}
                    </p>
                  </div>

                  <div className="text-center text-[11px] text-[var(--text-muted)] pt-2 border-t border-[var(--card-border)]/60">
                    请选择下方记忆反馈以推进复习排期
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4 Tonal Scale Memory Rating Buttons */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            {[
              {
                status: 'forgot' as const,
                label: '忘记',
                bg: theme.colors.c150,
                text: theme.colors.c900
              },
              {
                status: 'vague' as const,
                label: '模糊',
                bg: theme.colors.c300,
                text: theme.colors.c900
              },
              {
                status: 'to_review' as const,
                label: '记得',
                bg: theme.colors.c500,
                text: '#FFFFFF'
              },
              {
                status: 'mastered' as const,
                label: '熟练',
                bg: theme.colors.c700,
                text: '#FFFFFF'
              }
            ].map(btn => (
              <button
                key={btn.status}
                onClick={() => handleRateCard(btn.status)}
                className="py-3 rounded-xl font-bold text-xs transition-all active-press shadow-xs border border-black/5"
                style={{
                  backgroundColor: btn.bg,
                  color: btn.text
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 3. Word Library List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            积累词库 ({filteredWords.length})
          </h3>

          <div className="flex items-center gap-1.5">
            {/* Filter Pills */}
            <div className="flex bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-0.5 text-[11px]">
              {[
                { id: 'all', label: '全部' },
                { id: 'to_review', label: '待复习' },
                { id: 'mastered', label: '已熟练' }
              ].map(f => {
                const isSel = filterStatus === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilterStatus(f.id)}
                    className="px-2.5 py-1 rounded-lg font-medium transition-all"
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
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-70" />
          <input
            type="text"
            placeholder="搜索英文单词、中文释义或标签..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--text-primary)] transition-all"
          />
        </div>

        {/* Word Cards List */}
        <div className="space-y-2">
          {filteredWords.map(w => (
            <div
              key={w.id}
              className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-2 hover:border-black/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-[var(--text-primary)]">
                    {w.word}
                  </h4>
                  <span className="text-xs font-serif-quote italic text-[var(--text-secondary)]">
                    {w.ipa}
                  </span>
                  <span className="text-[10px] font-semibold text-[var(--text-secondary)] px-1.5 py-0.5 rounded bg-[var(--bg-main)]">
                    {w.pos}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button onClick={() => toggleWordFavorite(w.id)} aria-label={`收藏单词 ${w.word}`} className="p-1.5 rounded-lg text-[var(--text-secondary)]"><Heart className={`h-4 w-4 ${w.isFavorite ? 'fill-rose-400 text-rose-400' : ''}`} /></button>
                  <button
                    onClick={() => handlePlayAudio(w.word)}
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    title="朗读单词"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteWord(w.id, w.word)}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-50/70 transition-colors"
                    title="删除单词"
                    aria-label={`删除单词 ${w.word}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs font-medium text-[var(--text-primary)]">
                {w.meaning}
              </p>

              <div className="font-serif text-xs font-normal leading-relaxed text-[var(--text-secondary)] bg-[var(--bg-main)]/60 p-2.5 rounded-xl border border-[var(--card-border)]/60">
                “{w.exampleEn}”
              </div>

              <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-1">
                <span>标签: {w.tags.join(', ')}</span>
                <span>复习次数: {w.reviewCount} 次</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-2">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">添加学习单词</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[var(--text-secondary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] font-medium mb-1">英文单词</label>
                <input
                  type="text"
                  required
                  placeholder="例如: Meticulous"
                  value={newWordData.word}
                  onChange={e => setNewWordData({ ...newWordData, word: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--card-border)] text-[var(--text-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] font-medium mb-1">音标</label>
                  <input
                    type="text"
                    placeholder="/.../"
                    value={newWordData.ipa}
                    onChange={e => setNewWordData({ ...newWordData, ipa: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--card-border)] text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] font-medium mb-1">词性</label>
                  <input
                    type="text"
                    placeholder="adj. / v. / n."
                    value={newWordData.pos}
                    onChange={e => setNewWordData({ ...newWordData, pos: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--card-border)] text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-medium mb-1">中文释义</label>
                <input
                  type="text"
                  required
                  placeholder="例如: 极注意细节的，严谨的"
                  value={newWordData.meaning}
                  onChange={e => setNewWordData({ ...newWordData, meaning: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--card-border)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-medium mb-1">例句 (英文)</label>
                <textarea
                  rows={2}
                  placeholder="ChatGPT 上学到的真实例句..."
                  value={newWordData.exampleEn}
                  onChange={e => setNewWordData({ ...newWordData, exampleEn: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--card-border)] text-[var(--text-primary)]"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 rounded-xl font-bold text-white transition-all shadow-xs"
                style={{ backgroundColor: theme.primaryHex }}
              >
                保存至个人词库
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
