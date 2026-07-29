import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, RefreshCw, Sparkles, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generatePractice, savePracticeResult, type PracticeQuestion } from '../services/practice';

export const PracticeModal: React.FC = () => {
  const { theme, showPracticeModal, setShowPracticeModal, practiceErrorId } = useApp();
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [remainingGroups, setRemainingGroups] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [resumed, setResumed] = useState(false);
  const [error, setError] = useState('');

  const loadGroup = useCallback(async () => {
    if (!practiceErrorId) return;
    setLoading(true); setError(''); setCompleted(false); setQuestions([]);
    setCurrentIndex(0); setSelectedOption(null); setAnswers([]); setScore(0);
    try {
      const result = await generatePractice(practiceErrorId);
      setQuestions(result.questions); setSessionId(result.sessionId);
      setRemainingGroups(result.remainingGroups); setResumed(result.resumed);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '无法生成练习');
    } finally { setLoading(false); }
  }, [practiceErrorId]);

  useEffect(() => { if (showPracticeModal) void loadGroup(); }, [loadGroup, showPracticeModal]);
  if (!showPracticeModal) return null;

  const current = questions[currentIndex];
  const answered = selectedOption !== null;
  const wrongQuestions = questions.filter((question, index) => answers[index] !== question.correctIndex);

  const selectOption = (index: number) => {
    if (answered || !current) return;
    setSelectedOption(index);
    setAnswers(previous => [...previous, index]);
    if (index === current.correctIndex) setScore(previous => previous + 1);
  };

  const next = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(previous => previous + 1); setSelectedOption(null); return;
    }
    setSaving(true); setError('');
    try {
      await savePracticeResult(sessionId, answers, score);
      setCompleted(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '保存练习结果失败');
    } finally { setSaving(false); }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-md">
    <div className="relative max-h-[90vh] w-full max-w-sm space-y-4 overflow-y-auto rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-2xl">
      <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold"><Sparkles className="h-4 w-4" style={{ color: theme.primaryHex }} />针对性语法微练</div>
        <button aria-label="关闭练习" onClick={() => setShowPracticeModal(false)} className="rounded-full bg-[var(--bg-main)] p-1.5"><X className="h-4 w-4" /></button>
      </div>

      {loading && <div className="py-12 text-center text-xs text-[var(--text-secondary)]"><RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin" />正在准备 3 道题…</div>}
      {error && <div role="alert" className="rounded-xl bg-rose-500/10 p-3 text-xs text-rose-600">{error}</div>}

      {!loading && !completed && current && <>
        <div className="flex justify-between text-[11px] text-[var(--text-secondary)]"><span>题目 {currentIndex + 1} / 3{resumed ? ' · 已继续上次练习' : ''}</span><span>本条纠错完成后还可生成 {remainingGroups} 组</span></div>
        <div className="space-y-2 rounded-2xl border border-[var(--card-border)] bg-[var(--bg-main)] p-4">
          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: theme.colors.c150 }}>#{current.tag}</span>
          <p className="text-xs text-[var(--text-secondary)]">{current.title}</p><p className="text-sm font-bold">“{current.context}”</p>
        </div>
        <div className="space-y-2">{current.options.map((option, index) => {
          const correct = index === current.correctIndex;
          const selectedWrong = answered && index === selectedOption && !correct;
          const style = answered && correct ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700' : selectedWrong ? 'border-rose-500 bg-rose-500/15 text-rose-700' : 'border-[var(--card-border)] bg-[var(--bg-main)]';
          return <button key={option} disabled={answered} onClick={() => selectOption(index)} className={`flex w-full justify-between rounded-xl border p-3 text-left text-xs ${style}`}><span>{option}</span>{answered && correct && <CheckCircle2 className="h-4 w-4" />}{selectedWrong && <AlertCircle className="h-4 w-4" />}</button>;
        })}</div>
        {answered && <div className="rounded-xl border border-[var(--card-border)] bg-[var(--bg-main)] p-3 text-[11px] leading-5"><strong>考点解析：</strong>{current.explanation}</div>}
        {answered && <button disabled={saving} onClick={next} className="flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-xs font-bold text-white" style={{ backgroundColor: theme.primaryHex }}>{saving ? '正在保存…' : currentIndex < 2 ? '下一题' : '查看练习结果'}<ArrowRight className="h-4 w-4" /></button>}
      </>}

      {completed && <div className="space-y-4">
        <div className="rounded-2xl bg-[var(--bg-main)] p-5 text-center"><CheckCircle2 className="mx-auto mb-2 h-7 w-7 text-emerald-600" /><p className="text-lg font-bold">本组得分 {score} / 3</p><p className="mt-1 text-[11px] text-[var(--text-secondary)]">结果已保存 · 这条纠错今天还可生成 {remainingGroups} 组</p></div>
        {wrongQuestions.length > 0 ? <div className="space-y-2"><h3 className="text-xs font-bold">本组错题回顾</h3>{wrongQuestions.map(question => <div key={question.id} className="rounded-xl border border-[var(--card-border)] p-3 text-[11px] leading-5"><p className="font-bold">{question.context}</p><p className="text-emerald-700">正确答案：{question.options[question.correctIndex]}</p><p className="text-[var(--text-secondary)]">{question.explanation}</p></div>)}</div> : <p className="text-center text-xs text-emerald-700">三题全部答对，做得很好。</p>}
        <div className="flex gap-2">{remainingGroups > 0 && <button onClick={loadGroup} className="flex-1 rounded-xl border border-[var(--card-border)] py-2.5 text-xs font-bold">再练一组</button>}<button onClick={() => setShowPracticeModal(false)} className="flex-1 rounded-xl py-2.5 text-xs font-bold text-white" style={{ backgroundColor: theme.primaryHex }}>完成</button></div>
      </div>}
    </div>
  </div>;
};
