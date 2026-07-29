import { supabase } from '../lib/supabase';
import type { GrammarErrorItem, PhrasePatternItem, WordItem } from '../types';

export async function createWord(userId: string, word: Omit<WordItem, 'id' | 'reviewCount' | 'lastReviewed'>) {
  const { data, error } = await supabase.from('vocabulary_entries').insert({
    user_id: userId,
    normalized_term: word.word.trim().toLocaleLowerCase(),
    term: word.word.trim(),
    ipa: word.ipa || null,
    part_of_speech: word.pos || null,
    meaning_zh: word.meaning.trim(),
    example_en: word.exampleEn || null,
    example_zh: word.exampleZh || null,
    collocation: word.collocation || null,
    source_context: word.sourceDialogue || null,
    tags: word.tags,
    is_favorite: word.isFavorite ?? false,
  }).select('id, created_at').single();
  if (error) throw error;
  return { ...word, id: data.id, reviewCount: 0, lastReviewed: data.created_at.slice(0, 10) } as WordItem;
}

export async function createPhrase(userId: string, phrase: Omit<PhrasePatternItem, 'id'>) {
  const { data, error } = await supabase.from('sentence_entries').insert({
    user_id: userId,
    normalized_pattern: phrase.pattern.trim().toLocaleLowerCase(),
    pattern: phrase.pattern.trim(),
    meaning_zh: phrase.meaningZh.trim(),
    example_en: phrase.exampleEn || null,
    example_zh: phrase.exampleZh || null,
    category: phrase.category,
    source_tag: phrase.sourceTag || null,
    is_favorite: phrase.isFavorite,
  }).select('id').single();
  if (error) throw error;
  return { ...phrase, id: data.id } as PhrasePatternItem;
}

export async function createCorrection(userId: string, correction: Omit<GrammarErrorItem, 'id' | 'dateAdded'>) {
  const { data, error } = await supabase.from('correction_entries').insert({
    user_id: userId,
    category: correction.category,
    original_sentence: correction.originalSentence.trim(),
    corrected_sentence: correction.correctedSentence.trim(),
    explanation: correction.explanation || '',
    error_highlight: correction.errorHighlight || null,
    corrected_highlight: correction.correctedHighlight || null,
    occurrence_count: correction.occurrenceCount,
  }).select('id, created_at').single();
  if (error) throw error;
  return { ...correction, id: data.id, dateAdded: data.created_at.slice(0, 10) } as GrammarErrorItem;
}
