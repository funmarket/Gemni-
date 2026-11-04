-- P02 manual SQL Editor baseline, reconciled with the live database.
-- Applied manually before 20261104025649; this file is idempotent for source-controlled replay.
begin;
alter table public.profiles
  add column if not exists bio text not null default '',
  add column if not exists interests text[] not null default '{}'::text[],
  add column if not exists languages text[] not null default '{}'::text[],
  add column if not exists city text not null default '',
  add column if not exists area text not null default '',
  add column if not exists cultural_identity text not null default '',
  add column if not exists vibe_preferences text[] not null default '{}'::text[],
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.profile_preferences (
  profile_id text primary key references public.profiles(id) on delete cascade,
  telegram_handle text not null default '',
  x_handle text not null default '',
  preferred_contact_method text not null default 'none'
    check (preferred_contact_method in ('none','telegram','x','email')),
  locale text not null default 'auto',
  theme text not null default 'system',
  privacy jsonb not null default '{}'::jsonb,
  notifications jsonb not null default '{}'::jsonb,
  accessibility jsonb not null default '{}'::jsonb,
  cozy_diary_mode boolean not null default false,
  polar_romance_opt_in boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.profile_preferences enable row level security;
revoke all on public.profile_preferences from public, anon, authenticated;
grant select, insert on public.profile_preferences to authenticated;
grant update (
  telegram_handle, x_handle, preferred_contact_method, locale, theme,
  privacy, notifications, accessibility, cozy_diary_mode, polar_romance_opt_in
) on public.profile_preferences to authenticated;
drop policy if exists p02_owner_read on public.profile_preferences;
drop policy if exists p02_owner_insert on public.profile_preferences;
drop policy if exists p02_owner_update on public.profile_preferences;
create policy p02_owner_read on public.profile_preferences for select to authenticated
using (
  profile_id = 'usr_' || (select auth.uid())::text
  or exists (select 1 from public.s00_test_identity_links l
    where l.auth_user_id=(select auth.uid())
      and l.legacy_profile_id=profile_preferences.profile_id)
);
create policy p02_owner_insert on public.profile_preferences for insert to authenticated
with check (
  profile_id = 'usr_' || (select auth.uid())::text
  or exists (select 1 from public.s00_test_identity_links l
    where l.auth_user_id=(select auth.uid())
      and l.legacy_profile_id=profile_preferences.profile_id)
);
create policy p02_owner_update on public.profile_preferences for update to authenticated
using (
  profile_id = 'usr_' || (select auth.uid())::text
  or exists (select 1 from public.s00_test_identity_links l
    where l.auth_user_id=(select auth.uid())
      and l.legacy_profile_id=profile_preferences.profile_id)
)
with check (
  profile_id = 'usr_' || (select auth.uid())::text
  or exists (select 1 from public.s00_test_identity_links l
    where l.auth_user_id=(select auth.uid())
      and l.legacy_profile_id=profile_preferences.profile_id)
);
commit;
