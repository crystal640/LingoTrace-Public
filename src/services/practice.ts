import { supabase } from '../lib/supabase';

export interface PracticeQuestion {
  id: string; tag: string; title: string; context: string;
  options: string[]; correctIndex: number; explanation: string;
}

async function invokePractice(correctionId: string) {
  const { data, error } = await supabase.functions.invoke('generate-grammar-practice', { body: { correctionId } });
  if (error) {
    let message = data?.message ?? error.message;
    const response = (error as { context?: Response }).context;
    if (response) {
      const details = await response.clone().json().catch(() => null);
      message = details?.message ?? message;
    }
    throw new Error(message);
  }
  return data as { sessionId: string; questions: PracticeQuestion[]; remainingGroups: number; resumed: boolean };
}

export async function generatePractice(correctionId: string) {
  try {
    return await invokePractice(correctionId);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isTemporaryAiJsonError = /JSON|Unterminated string|Unexpected end|格式不正确/i.test(message);
    if (!isTemporaryAiJsonError) throw error;
    try {
      return await invokePractice(correctionId);
    } catch (retryError) {
      const retryMessage = retryError instanceof Error ? retryError.message : String(retryError);
      if (/JSON|Unterminated string|Unexpected end|格式不正确/i.test(retryMessage)) {
        throw new Error('AI 返回内容不完整，请点击重试。');
      }
      throw retryError;
    }
  }
}

export async function savePracticeResult(sessionId: string, answers: number[], score: number) {
  const { error } = await supabase.rpc('complete_practice_session', {
    practice_session_id: sessionId,
    practice_answers: answers,
    practice_score: score,
  });
  if (error) throw error;
}
