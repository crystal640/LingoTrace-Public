alter table public.vocabulary_entries add column if not exists deleted_at timestamptz;
alter table public.sentence_entries add column if not exists deleted_at timestamptz;
alter table public.correction_entries add column if not exists deleted_at timestamptz;

create index if not exists vocabulary_entries_active_idx on public.vocabulary_entries (user_id, created_at desc) where deleted_at is null;
create index if not exists sentence_entries_active_idx on public.sentence_entries (user_id, created_at desc) where deleted_at is null;
create index if not exists correction_entries_active_idx on public.correction_entries (user_id, created_at desc) where deleted_at is null;
