import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { ThemeId, UserSettings } from '../types';

export async function upsertProfile(user: User) {
  const metadata = user.user_metadata ?? {};
  const { data: existing, error: readError } = await supabase.from('profiles')
    .select('display_name')
    .eq('user_id', user.id)
    .maybeSingle();
  if (readError) throw readError;
  const googleName = metadata.full_name ?? metadata.name ?? '';
  const { error } = await supabase.from('profiles').upsert({
    user_id: user.id,
    display_name: existing?.display_name?.trim() || googleName,
    avatar_url: metadata.avatar_url ?? metadata.picture ?? null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  if (error) throw error;
}

export async function loadProfileSettings(userId: string): Promise<Partial<UserSettings>> {
  const { data, error } = await supabase.from('profiles')
    .select('display_name, avatar_url, theme_id, dark_mode, font_size, daily_goal_minutes, reminder_time')
    .eq('user_id', userId).single();
  if (error) throw error;
  return {
    name: data.display_name || undefined,
    avatar: data.avatar_url || undefined,
    themeId: data.theme_id as ThemeId,
    isDarkMode: data.dark_mode,
    fontSize: data.font_size as UserSettings['fontSize'],
    dailyGoalMinutes: data.daily_goal_minutes,
    reminderTime: String(data.reminder_time).slice(0, 5),
  };
}

export async function saveProfileSettings(userId: string, partial: Partial<UserSettings>) {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (partial.name !== undefined) row.display_name = partial.name.trim();
  if (partial.themeId !== undefined) row.theme_id = partial.themeId;
  if (partial.isDarkMode !== undefined) row.dark_mode = partial.isDarkMode;
  if (partial.fontSize !== undefined) row.font_size = partial.fontSize;
  if (partial.dailyGoalMinutes !== undefined) row.daily_goal_minutes = partial.dailyGoalMinutes;
  if (partial.reminderTime !== undefined) row.reminder_time = partial.reminderTime;
  const { error } = await supabase.from('profiles').update(row).eq('user_id', userId);
  if (error) throw error;
}
