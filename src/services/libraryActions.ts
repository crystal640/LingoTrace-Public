import { supabase } from '../lib/supabase';

export type LibraryKind = 'word' | 'phrase' | 'error';
const tableFor = (kind: LibraryKind) => ({ word: 'vocabulary_entries', phrase: 'sentence_entries', error: 'correction_entries' } as const)[kind];

export async function setFavorite(kind: 'word' | 'phrase', id: string, favorite: boolean) {
  const { error } = await supabase.from(tableFor(kind)).update({ is_favorite: favorite, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function softDelete(kind: LibraryKind, id: string) {
  const { error } = await supabase.from(tableFor(kind)).update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function restoreDeleted(kind: LibraryKind, id: string) {
  const { error } = await supabase.from(tableFor(kind)).update({ deleted_at: null }).eq('id', id);
  if (error) throw error;
}
