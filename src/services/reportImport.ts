import { supabase } from '../lib/supabase';

const MAX_PAYLOAD_LENGTH = 250_000;
const MAX_LIST_ITEMS = 100;
const MAX_TEXT_LENGTH = 10_000;

type ScoreName = 'overall' | 'fluency' | 'grammar' | 'vocabulary' | 'naturalness' | 'communication';

export interface ImportFeedbackItem {
  category?: string;
  content: string;
  action_label?: string;
  target_tab?: 'error' | 'phrase' | 'vocab';
}

export interface LingoTraceReportImport {
  schema_version: 'LINGOTRACE_REPORT_V1';
  report_id: string;
  source_message_id: string;
  source_conversation_id?: string;
  learning_date: string;
  timezone?: string;
  total_minutes: number;
  speaking_minutes: number;
  scores: Record<ScoreName, number>;
  qualitative_review: string;
  topics: string[];
  thought?: { zh: string; en?: string };
  strengths: string[];
  improvements: ImportFeedbackItem[];
  next_goals: string[];
  vocabulary: Array<{
    term: string;
    ipa?: string;
    part_of_speech?: string;
    meaning_zh: string;
    example_en?: string;
    example_zh?: string;
    collocation?: string;
    source_context?: string;
    tags?: string[];
  }>;
  sentences: Array<{
    pattern: string;
    meaning_zh: string;
    example_en?: string;
    example_zh?: string;
    category?: 'daily' | 'work' | 'travel' | 'opinion' | 'emotion';
    source_tag?: string;
  }>;
  corrections: Array<{
    category: 'grammar' | 'spelling' | 'word_choice' | 'collocation' | 'naturalness';
    original_sentence: string;
    corrected_sentence: string;
    explanation: string;
    memory_tip?: string;
    error_highlight?: string;
    corrected_highlight?: string;
  }>;
}

export interface ImportPreview {
  payload: LingoTraceReportImport;
  counts: { topics: number; vocabulary: number; sentences: number; corrections: number };
}

const REPORT_BEGIN_MARKER = 'LINGOTRACE_REPORT_V1_BEGIN';
const REPORT_END_MARKER = 'LINGOTRACE_REPORT_V1_END';

function extractJsonPayload(raw: string): string {
  const trimmed = raw.replace(/^\uFEFF/, '').trim();
  const markerStart = trimmed.indexOf(REPORT_BEGIN_MARKER);
  const markerEnd = trimmed.indexOf(REPORT_END_MARKER);

  if (markerStart >= 0 && markerEnd > markerStart) {
    return trimmed.slice(markerStart + REPORT_BEGIN_MARKER.length, markerEnd).trim();
  }

  const fencedJson = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedJson?.[1]) return fencedJson[1].trim();

  return trimmed;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function requiredText(value: unknown, field: string, max = MAX_TEXT_LENGTH): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} 不能为空`);
  if (value.length > max) throw new Error(`${field} 过长`);
  return value.trim();
}

function optionalText(value: unknown, field: string): string | undefined {
  if (value == null || value === '') return undefined;
  return requiredText(value, field);
}

function numberInRange(value: unknown, field: string, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${field} 必须是 ${min}–${max} 之间的数字`);
  }
  return value;
}

function list(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${field} 必须是数组`);
  if (value.length > MAX_LIST_ITEMS) throw new Error(`${field} 最多允许 ${MAX_LIST_ITEMS} 项`);
  return value;
}

export function parseReportImport(raw: string): ImportPreview {
  if (!raw.trim()) throw new Error('请粘贴 JSON，或上传 JSON/TXT 文件');
  if (raw.length > MAX_PAYLOAD_LENGTH) throw new Error('导入内容超过 250 KB 限制');

  let input: unknown;
  try {
    input = JSON.parse(extractJsonPayload(raw));
  } catch {
    throw new Error('没有识别到有效的 LingoTrace 日报。支持纯 JSON、AI 输出的 JSON 代码块，或带 LINGOTRACE_REPORT_V1_BEGIN/END 标记的 TXT');
  }
  if (!isObject(input)) throw new Error('导入内容必须是一个 JSON 对象');
  if (input.schema_version !== 'LINGOTRACE_REPORT_V1') {
    throw new Error('schema_version 必须是 LINGOTRACE_REPORT_V1');
  }

  const learningDate = requiredText(input.learning_date, 'learning_date', 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(learningDate) || Number.isNaN(Date.parse(`${learningDate}T00:00:00Z`))) {
    throw new Error('learning_date 必须是有效的 YYYY-MM-DD 日期');
  }
  if (!isObject(input.scores)) throw new Error('scores 必须是对象');
  const scoreNames: ScoreName[] = ['overall', 'fluency', 'grammar', 'vocabulary', 'naturalness', 'communication'];
  const scores = Object.fromEntries(
    scoreNames.map(name => [name, numberInRange(input.scores[name], `scores.${name}`, 0, 10)])
  ) as Record<ScoreName, number>;

  const topics = list(input.topics, 'topics').map((item, index) => requiredText(item, `topics[${index}]`, 200));
  const strengths = list(input.strengths, 'strengths').map((item, index) => requiredText(item, `strengths[${index}]`));
  const nextGoals = list(input.next_goals, 'next_goals').map((item, index) => requiredText(item, `next_goals[${index}]`));
  const improvements = list(input.improvements, 'improvements').map((item, index) => {
    if (!isObject(item)) throw new Error(`improvements[${index}] 必须是对象`);
    const target = item.target_tab;
    if (target != null && !['error', 'phrase', 'vocab'].includes(String(target))) {
      throw new Error(`improvements[${index}].target_tab 无效`);
    }
    return {
      category: optionalText(item.category, `improvements[${index}].category`),
      content: requiredText(item.content, `improvements[${index}].content`),
      action_label: optionalText(item.action_label, `improvements[${index}].action_label`),
      target_tab: target as ImportFeedbackItem['target_tab'],
    };
  });

  const vocabulary = list(input.vocabulary, 'vocabulary').map((item, index) => {
    if (!isObject(item)) throw new Error(`vocabulary[${index}] 必须是对象`);
    return {
      term: requiredText(item.term, `vocabulary[${index}].term`, 200),
      ipa: optionalText(item.ipa, `vocabulary[${index}].ipa`),
      part_of_speech: optionalText(item.part_of_speech, `vocabulary[${index}].part_of_speech`),
      meaning_zh: requiredText(item.meaning_zh, `vocabulary[${index}].meaning_zh`),
      example_en: optionalText(item.example_en, `vocabulary[${index}].example_en`),
      example_zh: optionalText(item.example_zh, `vocabulary[${index}].example_zh`),
      collocation: optionalText(item.collocation, `vocabulary[${index}].collocation`),
      source_context: optionalText(item.source_context, `vocabulary[${index}].source_context`),
      tags: item.tags == null ? [] : list(item.tags, `vocabulary[${index}].tags`).map((tag, tagIndex) =>
        requiredText(tag, `vocabulary[${index}].tags[${tagIndex}]`, 100)
      ),
    };
  });
  const sentenceCategories = ['daily', 'work', 'travel', 'opinion', 'emotion'];
  const sentences = list(input.sentences, 'sentences').map((item, index) => {
    if (!isObject(item)) throw new Error(`sentences[${index}] 必须是对象`);
    const category = item.category ?? 'daily';
    if (!sentenceCategories.includes(String(category))) throw new Error(`sentences[${index}].category 无效`);
    return {
      pattern: requiredText(item.pattern, `sentences[${index}].pattern`),
      meaning_zh: requiredText(item.meaning_zh, `sentences[${index}].meaning_zh`),
      example_en: optionalText(item.example_en, `sentences[${index}].example_en`),
      example_zh: optionalText(item.example_zh, `sentences[${index}].example_zh`),
      category: category as LingoTraceReportImport['sentences'][number]['category'],
      source_tag: optionalText(item.source_tag, `sentences[${index}].source_tag`),
    };
  });
  const correctionCategories = ['grammar', 'spelling', 'word_choice', 'collocation', 'naturalness'];
  const corrections = list(input.corrections, 'corrections').map((item, index) => {
    if (!isObject(item)) throw new Error(`corrections[${index}] 必须是对象`);
    if (!correctionCategories.includes(String(item.category))) throw new Error(`corrections[${index}].category 无效`);
    return {
      category: item.category as LingoTraceReportImport['corrections'][number]['category'],
      original_sentence: requiredText(item.original_sentence, `corrections[${index}].original_sentence`),
      corrected_sentence: requiredText(item.corrected_sentence, `corrections[${index}].corrected_sentence`),
      explanation: requiredText(item.explanation, `corrections[${index}].explanation`),
      memory_tip: optionalText(item.memory_tip, `corrections[${index}].memory_tip`),
      error_highlight: optionalText(item.error_highlight, `corrections[${index}].error_highlight`),
      corrected_highlight: optionalText(item.corrected_highlight, `corrections[${index}].corrected_highlight`),
    };
  });

  let thought: LingoTraceReportImport['thought'];
  if (input.thought != null) {
    if (!isObject(input.thought)) throw new Error('thought 必须是对象');
    thought = { zh: requiredText(input.thought.zh, 'thought.zh'), en: optionalText(input.thought.en, 'thought.en') };
  }

  const payload: LingoTraceReportImport = {
    schema_version: 'LINGOTRACE_REPORT_V1',
    report_id: requiredText(input.report_id, 'report_id', 200),
    source_message_id: requiredText(input.source_message_id, 'source_message_id', 200),
    source_conversation_id: optionalText(input.source_conversation_id, 'source_conversation_id'),
    learning_date: learningDate,
    timezone: optionalText(input.timezone, 'timezone') ?? 'Asia/Shanghai',
    total_minutes: numberInRange(input.total_minutes, 'total_minutes', 0, 1440),
    speaking_minutes: numberInRange(input.speaking_minutes, 'speaking_minutes', 0, 1440),
    scores,
    qualitative_review: requiredText(input.qualitative_review, 'qualitative_review'),
    topics,
    thought,
    strengths,
    improvements,
    next_goals: nextGoals,
    vocabulary,
    sentences,
    corrections,
  };
  if (payload.speaking_minutes > payload.total_minutes) throw new Error('speaking_minutes 不能大于 total_minutes');
  return { payload, counts: { topics: topics.length, vocabulary: vocabulary.length, sentences: sentences.length, corrections: corrections.length } };
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

const normalizeKey = (value: string) => value.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
const correctionKey = (item: { category: string; original_sentence: string; corrected_sentence: string }) =>
  [item.category, item.original_sentence, item.corrected_sentence].map(normalizeKey).join('\u0000');

export function mergeWeightedScore(
  existingScore: number | null,
  existingSpeakingMinutes: number,
  incomingScore: number,
  incomingSpeakingMinutes: number,
) {
  if (incomingSpeakingMinutes <= 0) return existingScore ?? incomingScore;
  if (existingSpeakingMinutes <= 0 || existingScore == null) return incomingScore;
  return Number((
    (existingScore * existingSpeakingMinutes + incomingScore * incomingSpeakingMinutes)
    / (existingSpeakingMinutes + incomingSpeakingMinutes)
  ).toFixed(2));
}

function uniqueIncoming<T>(incoming: T[], existingKeys: Set<string>, getKey: (item: T) => string) {
  return incoming.filter(item => {
    const key = getKey(item);
    if (existingKeys.has(key)) return false;
    existingKeys.add(key);
    return true;
  });
}

async function recordSyncEvent(userId: string, payload: LingoTraceReportImport, status: 'created' | 'duplicate' | 'rejected', details: Record<string, unknown>) {
  await supabase.from('sync_events').insert({
    user_id: userId,
    report_id: payload.report_id,
    source_message_id: payload.source_message_id,
    status,
    details,
  });
}

async function importReportInBrowser(userId: string, payload: LingoTraceReportImport): Promise<'created' | 'merged' | 'duplicate'> {
  const contentHash = await sha256(JSON.stringify(payload));
  const [sameReport, sameMessage, sameContent, sameDate] = await Promise.all([
    supabase.from('learning_reports').select('id').eq('user_id', userId).eq('report_id', payload.report_id).limit(1),
    supabase.from('learning_reports').select('id').eq('user_id', userId).eq('source_message_id', payload.source_message_id).limit(1),
    supabase.from('learning_reports').select('id').eq('user_id', userId).eq('content_hash', contentHash).limit(1),
    supabase.from('learning_reports').select(`
      id, report_id, source_message_id, source_conversation_id, content_hash, raw_payload,
      total_minutes, speaking_minutes, overall_score, fluency_score, grammar_score,
      vocabulary_score, naturalness_score, communication_score, qualitative_review,
      learning_topics(label, position),
      daily_thoughts(id),
      feedback_items(kind, category, content, action_label, target_tab, position)
    `).eq('user_id', userId).eq('learning_date', payload.learning_date).limit(1).maybeSingle(),
  ]);
  if (sameReport.error) throw sameReport.error;
  if (sameMessage.error) throw sameMessage.error;
  if (sameContent.error) throw sameContent.error;
  if (sameDate.error) throw sameDate.error;
  if (sameReport.data?.length || sameMessage.data?.length || sameContent.data?.length) {
    await recordSyncEvent(userId, payload, 'duplicate', { reason: 'report_id_source_message_id_or_content_hash_exists' });
    return 'duplicate';
  }

  const existing = sameDate.data;
  const reportValues = {
    user_id: userId,
    report_id: payload.report_id,
    schema_version: payload.schema_version,
    source_conversation_id: payload.source_conversation_id ?? null,
    source_message_id: payload.source_message_id,
    content_hash: contentHash,
    learning_date: payload.learning_date,
    timezone: payload.timezone,
    total_minutes: payload.total_minutes,
    speaking_minutes: payload.speaking_minutes,
    overall_score: payload.scores.overall,
    fluency_score: payload.scores.fluency,
    grammar_score: payload.scores.grammar,
    vocabulary_score: payload.scores.vocabulary,
    naturalness_score: payload.scores.naturalness,
    communication_score: payload.scores.communication,
    qualitative_review: payload.qualitative_review,
    raw_payload: payload,
  };
  let databaseReportId: string;
  if (existing) {
    databaseReportId = existing.id;
  } else {
    const reportResult = await supabase.from('learning_reports').insert(reportValues).select('id').single();
    if (reportResult.error) throw reportResult.error;
    databaseReportId = reportResult.data.id;
  }

  try {
    const [wordsResult, sentencesResult, correctionsResult] = await Promise.all([
      supabase.from('vocabulary_entries').select('normalized_term').eq('user_id', userId),
      supabase.from('sentence_entries').select('normalized_pattern').eq('user_id', userId),
      supabase.from('correction_entries').select('category, original_sentence, corrected_sentence').eq('user_id', userId),
    ]);
    const lookupError = wordsResult.error ?? sentencesResult.error ?? correctionsResult.error;
    if (lookupError) throw lookupError;

    const topics = uniqueIncoming(
      payload.topics,
      new Set((existing?.learning_topics ?? []).map(item => normalizeKey(item.label))),
      normalizeKey,
    );
    const feedbackKeys = new Set((existing?.feedback_items ?? []).map(item =>
      `${item.kind}\u0000${normalizeKey(item.content)}`
    ));
    const strengths = uniqueIncoming(payload.strengths, feedbackKeys, content => `strength\u0000${normalizeKey(content)}`);
    const improvements = uniqueIncoming(payload.improvements, feedbackKeys, item => `improvement\u0000${normalizeKey(item.content)}`);
    const nextGoals = uniqueIncoming(payload.next_goals, feedbackKeys, content => `next_goal\u0000${normalizeKey(content)}`);
    const vocabulary = uniqueIncoming(
      payload.vocabulary,
      new Set((wordsResult.data ?? []).map(item => item.normalized_term)),
      item => normalizeKey(item.term),
    );
    const sentences = uniqueIncoming(
      payload.sentences,
      new Set((sentencesResult.data ?? []).map(item => item.normalized_pattern)),
      item => normalizeKey(item.pattern),
    );
    const corrections = uniqueIncoming(
      payload.corrections,
      new Set((correctionsResult.data ?? []).map(correctionKey)),
      correctionKey,
    );

    const operations = [];
    const topicOffset = existing?.learning_topics?.length ?? 0;
    if (topics.length) operations.push(supabase.from('learning_topics').insert(topics.map((label, position) => ({
      user_id: userId, report_id: databaseReportId, label, position: topicOffset + position,
    }))));
    if (payload.thought && !(existing?.daily_thoughts?.length)) operations.push(supabase.from('daily_thoughts').insert({
      user_id: userId, report_id: databaseReportId, zh: payload.thought.zh, en: payload.thought.en ?? null,
    }));
    const positions = (existing?.feedback_items ?? []).reduce<Record<string, number>>((result, item) => {
      result[item.kind] = Math.max(result[item.kind] ?? -1, item.position);
      return result;
    }, {});
    const feedback = [
      ...strengths.map((content, position) => ({ user_id: userId, report_id: databaseReportId, kind: 'strength', content, position: (positions.strength ?? -1) + 1 + position })),
      ...improvements.map((item, position) => ({
        user_id: userId, report_id: databaseReportId, kind: 'improvement', category: item.category ?? null,
        content: item.content, action_label: item.action_label ?? null, target_tab: item.target_tab ?? null,
        position: (positions.improvement ?? -1) + 1 + position,
      })),
      ...nextGoals.map((content, position) => ({ user_id: userId, report_id: databaseReportId, kind: 'next_goal', content, position: (positions.next_goal ?? -1) + 1 + position })),
    ];
    if (feedback.length) operations.push(supabase.from('feedback_items').insert(feedback));
    if (vocabulary.length) operations.push(supabase.from('vocabulary_entries').insert(vocabulary.map(item => ({
      user_id: userId, source_report_id: databaseReportId, normalized_term: normalizeKey(item.term),
      term: item.term, ipa: item.ipa ?? null, part_of_speech: item.part_of_speech ?? null, meaning_zh: item.meaning_zh,
      example_en: item.example_en ?? null, example_zh: item.example_zh ?? null, collocation: item.collocation ?? null,
      source_context: item.source_context ?? null, tags: item.tags ?? [],
    }))));
    if (sentences.length) operations.push(supabase.from('sentence_entries').insert(sentences.map(item => ({
      user_id: userId, source_report_id: databaseReportId, normalized_pattern: normalizeKey(item.pattern),
      pattern: item.pattern, meaning_zh: item.meaning_zh, example_en: item.example_en ?? null, example_zh: item.example_zh ?? null,
      category: item.category ?? 'daily', source_tag: item.source_tag ?? null,
    }))));
    if (corrections.length) operations.push(supabase.from('correction_entries').insert(corrections.map(item => ({
      user_id: userId, source_report_id: databaseReportId, ...item,
    }))));

    const results = await Promise.all(operations);
    const error = results.find(result => result.error)?.error;
    if (error) throw error;

    if (existing) {
      const oldSpeakingMinutes = existing.speaking_minutes ?? 0;
      const incomingSpeakingMinutes = payload.speaking_minutes;
      const combinedPayload = isObject(existing.raw_payload) && Array.isArray(existing.raw_payload.imports)
        ? { imports: [...existing.raw_payload.imports, payload] }
        : { imports: [existing.raw_payload, payload] };
      const updateResult = await supabase.from('learning_reports').update({
        total_minutes: (existing.total_minutes ?? 0) + payload.total_minutes,
        speaking_minutes: oldSpeakingMinutes + incomingSpeakingMinutes,
        overall_score: mergeWeightedScore(existing.overall_score, oldSpeakingMinutes, payload.scores.overall, incomingSpeakingMinutes),
        fluency_score: mergeWeightedScore(existing.fluency_score, oldSpeakingMinutes, payload.scores.fluency, incomingSpeakingMinutes),
        grammar_score: mergeWeightedScore(existing.grammar_score, oldSpeakingMinutes, payload.scores.grammar, incomingSpeakingMinutes),
        vocabulary_score: mergeWeightedScore(existing.vocabulary_score, oldSpeakingMinutes, payload.scores.vocabulary, incomingSpeakingMinutes),
        naturalness_score: mergeWeightedScore(existing.naturalness_score, oldSpeakingMinutes, payload.scores.naturalness, incomingSpeakingMinutes),
        communication_score: mergeWeightedScore(existing.communication_score, oldSpeakingMinutes, payload.scores.communication, incomingSpeakingMinutes),
        qualitative_review: [existing.qualitative_review, payload.qualitative_review]
          .filter((value, index, values) => value && values.indexOf(value) === index)
          .join('\n\n'),
        raw_payload: combinedPayload,
        imported_at: new Date().toISOString(),
      }).eq('id', databaseReportId).eq('user_id', userId);
      if (updateResult.error) throw updateResult.error;
    }

    const action = existing ? 'merged' : 'created';
    await recordSyncEvent(userId, payload, 'created', {
      action,
      content_hash: contentHash,
      counts: { topics: topics.length, vocabulary: vocabulary.length, sentences: sentences.length, corrections: corrections.length },
    });
    return action;
  } catch (error) {
    await recordSyncEvent(userId, payload, 'rejected', { error: error instanceof Error ? error.message : 'unknown_error' });
    throw error;
  }
}

export async function importReport(userId: string, payload: LingoTraceReportImport): Promise<'created' | 'merged' | 'duplicate'> {
  const { data, error } = await supabase.rpc('import_lingotrace_report', { report_payload: payload });
  if (!error) {
    const result = typeof data === 'string' ? data : data?.result;
    if (result === 'created' || result === 'merged' || result === 'duplicate') return result;
    throw new Error('数据库返回了无法识别的导入结果');
  }

  // Keep imports available until the new database migration has been applied.
  if (error.code === 'PGRST202' || error.code === '42883') {
    return importReportInBrowser(userId, payload);
  }
  throw error;
}

export const REPORT_IMPORT_EXAMPLE = JSON.stringify({
  schema_version: 'LINGOTRACE_REPORT_V1',
  report_id: 'report-2026-07-27-example',
  source_message_id: 'chatgpt-message-example',
  source_conversation_id: 'chatgpt-conversation-example',
  learning_date: '2026-07-27',
  timezone: 'Asia/Shanghai',
  total_minutes: 30,
  speaking_minutes: 15,
  scores: { overall: 8.2, fluency: 8, grammar: 7.5, vocabulary: 8.5, naturalness: 8, communication: 9 },
  qualitative_review: '今天能够清晰表达观点，下一步继续提高语法准确度。',
  topics: ['日常表达'],
  thought: { zh: '持续练习比追求一次完美更重要。', en: 'Consistency matters more than perfection.' },
  strengths: ['表达思路清晰'],
  improvements: [{ category: '语法', content: '注意第三人称单数', action_label: '查看纠错', target_tab: 'error' }],
  next_goals: ['完成一次第三人称单数专项练习'],
  vocabulary: [{ term: 'consistency', part_of_speech: 'noun', meaning_zh: '持续性；一致性', tags: ['日常表达'] }],
  sentences: [{ pattern: 'What matters most is...', meaning_zh: '最重要的是……', category: 'opinion' }],
  corrections: [{ category: 'grammar', original_sentence: 'She go to school.', corrected_sentence: 'She goes to school.', explanation: '第三人称单数一般现在时动词加 -s。' }],
}, null, 2);
