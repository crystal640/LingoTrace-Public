create extension if not exists pgcrypto;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  timezone text not null default 'Asia/Shanghai',
  theme_id text not null default 'sage',
  daily_goal_minutes integer not null default 30 check (daily_goal_minutes between 1 and 1440),
  reminder_time time not null default '20:30',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.learning_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_id text not null,
  schema_version text not null default 'LINGOTRACE_REPORT_V1',
  source_conversation_id text,
  source_message_id text not null,
  content_hash text not null,
  learning_date date not null,
  timezone text not null default 'Asia/Shanghai',
  total_minutes integer not null default 0 check (total_minutes between 0 and 1440),
  speaking_minutes integer not null default 0 check (speaking_minutes between 0 and 1440),
  overall_score numeric(4,2) check (overall_score between 0 and 10),
  fluency_score numeric(4,2) check (fluency_score between 0 and 10),
  grammar_score numeric(4,2) check (grammar_score between 0 and 10),
  vocabulary_score numeric(4,2) check (vocabulary_score between 0 and 10),
  naturalness_score numeric(4,2) check (naturalness_score between 0 and 10),
  communication_score numeric(4,2) check (communication_score between 0 and 10),
  qualitative_review text not null default '',
  raw_payload jsonb not null,
  imported_at timestamptz not null default now(),
  unique (user_id, report_id),
  unique (user_id, source_message_id)
);

create index learning_reports_user_date_idx
  on public.learning_reports (user_id, learning_date desc);

create table public.learning_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_id uuid not null references public.learning_reports(id) on delete cascade,
  label text not null,
  position integer not null default 0
);

create table public.daily_thoughts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_id uuid not null references public.learning_reports(id) on delete cascade,
  zh text not null,
  en text,
  is_saved boolean not null default false
);

create table public.feedback_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_id uuid not null references public.learning_reports(id) on delete cascade,
  kind text not null check (kind in ('strength', 'improvement', 'next_goal')),
  category text,
  content text not null,
  action_label text,
  target_tab text check (target_tab in ('error', 'phrase', 'vocab') or target_tab is null),
  position integer not null default 0
);

create table public.vocabulary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_report_id uuid references public.learning_reports(id) on delete set null,
  normalized_term text not null,
  term text not null,
  ipa text,
  part_of_speech text,
  meaning_zh text not null,
  example_en text,
  example_zh text,
  collocation text,
  source_context text,
  tags text[] not null default '{}',
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, normalized_term)
);

create table public.sentence_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_report_id uuid references public.learning_reports(id) on delete set null,
  normalized_pattern text not null,
  pattern text not null,
  meaning_zh text not null,
  example_en text,
  example_zh text,
  category text not null default 'daily',
  source_tag text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, normalized_pattern)
);

create table public.correction_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_report_id uuid references public.learning_reports(id) on delete set null,
  category text not null check (category in ('grammar', 'spelling', 'word_choice', 'collocation', 'naturalness')),
  original_sentence text not null,
  corrected_sentence text not null,
  explanation text not null,
  memory_tip text,
  error_highlight text,
  corrected_highlight text,
  occurrence_count integer not null default 1 check (occurrence_count > 0),
  created_at timestamptz not null default now()
);

create table public.review_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in ('vocabulary', 'sentence', 'correction')),
  item_id uuid not null,
  state text not null default 'new' check (state in ('new', 'learning', 'review', 'relearning', 'mastered')),
  difficulty numeric(8,4) not null default 0,
  stability numeric(10,4) not null default 0,
  due_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  review_count integer not null default 0,
  lapse_count integer not null default 0,
  unique (user_id, item_type, item_id)
);

create table public.review_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  review_state_id uuid not null references public.review_states(id) on delete cascade,
  rating text not null check (rating in ('forgot', 'vague', 'remembered', 'mastered')),
  reviewed_at timestamptz not null default now(),
  previous_due_at timestamptz,
  next_due_at timestamptz not null
);

create table public.sync_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_id text,
  source_message_id text,
  status text not null check (status in ('created', 'duplicate', 'conflict', 'rejected')),
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.learning_reports enable row level security;
alter table public.learning_topics enable row level security;
alter table public.daily_thoughts enable row level security;
alter table public.feedback_items enable row level security;
alter table public.vocabulary_entries enable row level security;
alter table public.sentence_entries enable row level security;
alter table public.correction_entries enable row level security;
alter table public.review_states enable row level security;
alter table public.review_logs enable row level security;
alter table public.sync_events enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'learning_reports', 'learning_topics', 'daily_thoughts',
    'feedback_items', 'vocabulary_entries', 'sentence_entries',
    'correction_entries', 'review_states', 'review_logs', 'sync_events'
  ] loop
    execute format(
      'create policy %I on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      table_name || '_owner_access', table_name
    );
  end loop;
end $$;
