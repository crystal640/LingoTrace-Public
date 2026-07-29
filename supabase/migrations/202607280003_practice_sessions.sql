create table public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  correction_id uuid not null references public.correction_entries(id) on delete cascade,
  practice_date date not null default ((now() at time zone 'Asia/Shanghai')::date),
  questions jsonb not null,
  answers jsonb,
  score integer check (score between 0 and 3),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index practice_sessions_user_date_idx
  on public.practice_sessions (user_id, practice_date, created_at desc);

alter table public.practice_sessions enable row level security;
create policy practice_sessions_owner_access on public.practice_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
