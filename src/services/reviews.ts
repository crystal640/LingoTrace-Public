import { supabase } from '../lib/supabase';
import type { WordItem } from '../types';

export type ReviewItemType = 'vocabulary' | 'sentence' | 'correction';
export type ReviewRating = 'forgot' | 'vague' | 'remembered' | 'mastered';

const ratingFor: Record<WordItem['status'], 'forgot' | 'vague' | 'remembered' | 'mastered'> = {
  forgot: 'forgot', vague: 'vague', to_review: 'remembered', mastered: 'mastered',
};

export async function recordReview(itemType: ReviewItemType, itemId: string, rating: ReviewRating) {
  const { data, error } = await supabase.rpc('record_lightweight_review', {
    review_item_type: itemType,
    review_item_id: itemId,
    review_rating: rating,
  });
  if (error) throw error;
  return data as string;
}

export function recordWordReview(itemId: string, status: WordItem['status']) {
  return recordReview('vocabulary', itemId, ratingFor[status]);
}

export function recordPhraseReview(itemId: string, remembered: boolean) {
  return recordReview('sentence', itemId, remembered ? 'remembered' : 'forgot');
}
