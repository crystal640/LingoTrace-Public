import React, { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, FileJson, Upload, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { importReport, parseReportImport, REPORT_IMPORT_EXAMPLE, type ImportPreview } from '../services/reportImport';

export const ReportImportModal: React.FC = () => {
  const { user } = useAuth();
  const { theme, showReportImportModal, setShowReportImportModal, refreshLearningData, updateSettings } = useApp();
  const [raw, setRaw] = useState('');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!showReportImportModal) return null;

  const resetMessages = () => {
    setPreview(null);
    setError('');
    setStatus('');
  };

  const close = () => {
    if (busy) return;
    setShowReportImportModal(false);
    setRaw('');
    resetMessages();
  };

  const validate = () => {
    setError('');
    setStatus('');
    try {
      setPreview(parseReportImport(raw));
    } catch (reason) {
      setPreview(null);
      setError(reason instanceof Error ? reason.message : '无法解析导入内容');
    }
  };

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    resetMessages();
    if (file.size > 250_000) {
      setError('文件超过 250 KB 限制');
      return;
    }
    const content = await file.text();
    setRaw(content);
    try {
      setPreview(parseReportImport(content));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '无法解析文件');
    } finally {
      event.target.value = '';
    }
  };

  const confirmImport = async () => {
    if (!user || !preview) return;
    setBusy(true);
    setError('');
    setStatus('');
    try {
      const result = await importReport(user.id, preview.payload);
      if (result === 'duplicate') {
        setStatus('这份日报已经导入过，没有创建重复记录。');
      } else {
        await refreshLearningData();
        updateSettings({ lastSyncTime: '刚刚' });
        setStatus(result === 'merged'
          ? '已合并到当天日报：时长已累加，评分已按开口时长加权，学习内容已去重保留。'
          : '导入成功。首页、历史、单词、句型和纠错数据已刷新。');
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '导入失败，请稍后重试');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-md max-h-[88dvh] flex-col overflow-hidden rounded-t-[28px] sm:rounded-[28px] border border-[var(--card-border)] bg-[var(--card-bg)] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-[var(--card-border)] bg-[var(--card-bg)] px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <FileJson className="h-5 w-5" style={{ color: theme.primaryHex }} />
              <h2 className="text-base font-bold text-[var(--text-primary)]">导入 ChatGPT 日报</h2>
            </div>
            <p className="mt-1 text-[11px] leading-5 text-[var(--text-secondary)]">
              上传 AI 生成的 TXT/JSON，或直接粘贴内容；预览无误后写入你的账号。
            </p>
          </div>
          <button onClick={close} disabled={busy} aria-label="关闭导入窗口" className="rounded-full bg-[var(--bg-main)] p-2 text-[var(--text-secondary)]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        {!user && (
          <div className="mt-4 flex gap-2 rounded-xl bg-amber-500/10 p-3 text-[11px] leading-5 text-amber-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            请先登录 Google 账号。访客模式可以预览 JSON，但不能写入数据库。
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button onClick={() => fileRef.current?.click()} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--card-border)] bg-[var(--bg-main)] px-3 py-2 text-xs font-bold text-[var(--text-primary)]">
            <Upload className="h-3.5 w-3.5" /> 选择 TXT/JSON
          </button>
          <button onClick={() => { setRaw(REPORT_IMPORT_EXAMPLE); resetMessages(); }} className="rounded-xl border border-[var(--card-border)] px-3 py-2 text-xs font-bold text-[var(--text-secondary)]">
            填入示例
          </button>
          <input ref={fileRef} type="file" accept=".json,.txt,application/json,text/plain" onChange={handleFile} className="hidden" />
        </div>

        <textarea
          value={raw}
          onChange={event => { setRaw(event.target.value); resetMessages(); }}
          placeholder={'在这里粘贴 AI 生成的日报…\n\n支持纯 JSON、```json 代码块，以及 LINGOTRACE_REPORT_V1_BEGIN/END 标记包裹的 TXT。'}
          spellCheck={false}
          className={`${preview ? 'min-h-24 max-h-32' : 'min-h-40 max-h-56'} mt-3 w-full resize-y rounded-2xl border border-[var(--card-border)] bg-[var(--bg-main)] p-3 font-mono text-[11px] leading-5 text-[var(--text-primary)] outline-none focus:ring-2`}
          style={{ '--tw-ring-color': theme.colors.c300 } as React.CSSProperties}
        />

        {!preview && (
          <button onClick={validate} disabled={!raw.trim() || busy} className="mt-3 w-full rounded-xl border border-[var(--card-border)] bg-[var(--bg-main)] py-2.5 text-xs font-bold text-[var(--text-primary)] disabled:opacity-40">
            校验并预览
          </button>
        )}

        {preview && (
          <section className="mt-4 rounded-2xl border border-[var(--card-border)] bg-[var(--bg-main)] p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> 格式校验通过
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div><span className="text-[var(--text-secondary)]">日期</span><strong className="ml-2">{preview.payload.learning_date}</strong></div>
              <div><span className="text-[var(--text-secondary)]">综合评分</span><strong className="ml-2">{preview.payload.scores.overall}/10</strong></div>
              <div><span className="text-[var(--text-secondary)]">主题</span><strong className="ml-2">{preview.counts.topics}</strong></div>
              <div><span className="text-[var(--text-secondary)]">单词</span><strong className="ml-2">{preview.counts.vocabulary}</strong></div>
              <div><span className="text-[var(--text-secondary)]">句型</span><strong className="ml-2">{preview.counts.sentences}</strong></div>
              <div><span className="text-[var(--text-secondary)]">纠错</span><strong className="ml-2">{preview.counts.corrections}</strong></div>
            </div>
            <p className="mt-3 line-clamp-3 text-[11px] leading-5 text-[var(--text-secondary)]">{preview.payload.qualitative_review}</p>
          </section>
        )}

        {error && <p role="alert" className="mt-3 rounded-xl bg-rose-500/10 p-3 text-[11px] leading-5 text-rose-600">{error}</p>}
        {status && <p role="status" className="mt-3 rounded-xl bg-emerald-500/10 p-3 text-[11px] leading-5 text-emerald-700">{status}</p>}

        </div>

        {preview && (
        <div className="shrink-0 border-t border-[var(--card-border)] bg-[var(--card-bg)] px-5 py-4">
        <button
          onClick={confirmImport}
          disabled={!user || !preview || busy}
          className="w-full rounded-xl py-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: theme.primaryHex }}
        >
          {busy ? '正在安全写入…' : '确认导入到我的账号'}
        </button>
        </div>
        )}
      </div>
    </div>
  );
};
