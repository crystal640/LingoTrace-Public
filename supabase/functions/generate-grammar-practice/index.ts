import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const questionSchema = {
  type: 'object',
  properties: {
    questions: {
      type: 'array', minItems: 3, maxItems: 3,
      items: {
        type: 'object',
        properties: {
          tag: { type: 'string' }, title: { type: 'string' }, context: { type: 'string' },
          options: { type: 'array', minItems: 4, maxItems: 4, items: { type: 'string' } },
          correctIndex: { type: 'integer', minimum: 0, maximum: 3 }, explanation: { type: 'string' },
        },
        required: ['tag', 'title', 'context', 'options', 'correctIndex', 'explanation'],
      },
    },
  },
  required: ['questions'],
};

type CorrectionForPractice = {
  category: string;
  original_sentence: string;
  corrected_sentence: string;
  explanation: string;
};

type PracticeQuestion = {
  id: string;
  tag: string;
  title: string;
  context: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

function buildFallbackQuestions(correction: CorrectionForPractice): PracticeQuestion[] {
  const correct = correction.corrected_sentence;
  const wrong = correction.original_sentence;
  const explanation = correction.explanation || '请比较原句与正确句，注意其中的语法和表达差异。';
  return [
    { id: 'q1', tag: correction.category, title: '请选择正确的表达：', context: 'Which sentence is correct?', options: [wrong, correct, `Maybe ${wrong}`, `Not: ${correct}`], correctIndex: 1, explanation },
    { id: 'q2', tag: correction.category, title: '请选择可以替换原句的表达：', context: wrong, options: [correct, wrong, `Always ${wrong}`, `Perhaps ${wrong}`], correctIndex: 0, explanation },
    { id: 'q3', tag: correction.category, title: '根据本次纠错，应该保留哪一句？', context: 'Choose the corrected version.', options: [`Not: ${correct}`, wrong, `Maybe: ${wrong}`, correct], correctIndex: 3, explanation },
  ];
}

function parseAiQuestions(text: string | undefined): PracticeQuestion[] {
  if (!text) throw new Error('AI 没有返回题目内容');
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed.questions) || parsed.questions.length !== 3) {
    throw new Error('AI 返回的题目数量不正确');
  }
  return parsed.questions.map((question: Record<string, unknown>, index: number) => {
    const options = question.options;
    const correctIndex = question.correctIndex;
    if (
      typeof question.tag !== 'string' || typeof question.title !== 'string' ||
      typeof question.context !== 'string' || typeof question.explanation !== 'string' ||
      !Array.isArray(options) || options.length !== 4 || !options.every(option => typeof option === 'string') ||
      !Number.isInteger(correctIndex) || (correctIndex as number) < 0 || (correctIndex as number) > 3
    ) {
      throw new Error('AI 返回的题目格式不正确');
    }
    return {
      id: `q${index + 1}`,
      tag: question.tag,
      title: question.title,
      context: question.context,
      options: options as string[],
      correctIndex: correctIndex as number,
      explanation: question.explanation,
    };
  });
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authorization = req.headers.get('Authorization');
    if (!authorization) throw new Error('请先登录');
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authorization } },
    });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('登录状态无效');
    const { correctionId } = await req.json();
    if (!correctionId) throw new Error('缺少纠错记录');

    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date());
    const { count } = await supabase.from('practice_sessions').select('id', { count: 'exact', head: true })
      .eq('practice_date', today)
      .eq('correction_id', correctionId);
    const { data: unfinished } = await supabase.from('practice_sessions')
      .select('id, questions').eq('practice_date', today).eq('correction_id', correctionId)
      .is('completed_at', null).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (unfinished) {
      return Response.json({ sessionId: unfinished.id, questions: unfinished.questions,
        remainingGroups: Math.max(0, 2 - (count ?? 0)), resumed: true },
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if ((count ?? 0) >= 2) {
      return Response.json({ code: 'DAILY_LIMIT', message: '这条纠错今天已完成两组练习，可以继续练习其他纠错。' }, { status: 429, headers: corsHeaders });
    }
    const { data: correction, error: correctionError } = await supabase.from('correction_entries')
      .select('id, category, original_sentence, corrected_sentence, explanation').eq('id', correctionId).single();
    if (correctionError || !correction) throw new Error('找不到这条纠错记录');

    let questions = buildFallbackQuestions(correction);
    const geminiAllowedUserIds = new Set(
      (Deno.env.get('GEMINI_ALLOWED_USER_IDS') ?? '')
        .split(',')
        .map(userId => userId.trim())
        .filter(Boolean),
    );
    const isGeminiAllowed = geminiAllowedUserIds.has(user.id);
    const apiKey = isGeminiAllowed ? Deno.env.get('GEMINI_API_KEY') : undefined;
    if (apiKey) {
      try {
        const model = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
        const prompt = `你是英语语法练习老师。根据以下纠错生成恰好3道简短的四选一练习。每题只有一个正确答案，围绕同一知识点但句子不要重复，解析使用简体中文。\n错误句：${correction.original_sentence}\n正确句：${correction.corrected_sentence}\n说明：${correction.explanation}`;
        const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: {
            temperature: 0.3, maxOutputTokens: 2400, responseMimeType: 'application/json', responseJsonSchema: questionSchema,
          } }),
        });
        if (!aiResponse.ok) throw new Error(`Gemini 请求失败 (${aiResponse.status})`);
        const aiData = await aiResponse.json();
        questions = parseAiQuestions(aiData.candidates?.[0]?.content?.parts?.[0]?.text);
      } catch (aiError) {
        console.warn('Falling back to local practice questions:', aiError instanceof Error ? aiError.message : aiError);
      }
    } else if (isGeminiAllowed) {
      console.warn('GEMINI_API_KEY is missing; using local practice questions');
    } else {
      console.info('Gemini is not enabled for this user; using local practice questions');
    }
    const { data: session, error: insertError } = await supabase.from('practice_sessions')
      .insert({ user_id: user.id, correction_id: correction.id, practice_date: today, questions }).select('id').single();
    if (insertError) throw insertError;
    return Response.json({ sessionId: session.id, questions, remainingGroups: 1 - (count ?? 0), resumed: false }, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    return Response.json({ message: error instanceof Error ? error.message : '无法生成练习' }, { status: 400, headers: corsHeaders });
  }
});
