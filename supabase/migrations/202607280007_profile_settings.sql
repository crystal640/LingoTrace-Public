alter table public.profiles
  add column if not exists dark_mode boolean not null default false,
  add column if not exists font_size text not null default 'normal'
    check (font_size in ('normal', 'medium', 'large'));
