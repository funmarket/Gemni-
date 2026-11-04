-- P02: D02 editable profile data and owner-scoped permissions.
-- Existing Auth users, historical profile IDs, handles, points, and content remain unchanged.
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

alter table public.profiles
  add constraint vq_p02_bio_max check (char_length(bio) <= 280),
  add constraint vq_p02_city_max check (char_length(city) <= 100),
  add constraint vq_p02_area_max check (char_length(area) <= 100),
  add constraint vq_p02_interests_max check (cardinality(interests) <= 30),
  add constraint vq_p02_languages_max check (cardinality(languages) <= 15),
  add constraint vq_p02_vibe_preferences_max check (cardinality(vibe_preferences) <= 30);

create table public.profile_preferences (
  profile_id text primary key references public.profiles(id) on delete cascade,
  telegram_handle text not null default '',
  x_handle text not null default '',
  preferred_contact_method text not null default 'none'
    check (preferred_contact_method in ('none', 'telegram', 'x', 'email')),
  locale text not null default 'auto',
  theme text not null default 'system',
  privacy jsonb not null default '{}'::jsonb check (jsonb_typeof(privacy) = 'object'),
  notifications jsonb not null default '{}'::jsonb check (jsonb_typeof(notifications) = 'object'),
  accessibility jsonb not null default '{}'::jsonb check (jsonb_typeof(accessibility) = 'object'),
  cozy_diary_mode boolean not null default false,
  polar_romance_opt_in boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint vq_p02_telegram_handle_max check (char_length(telegram_handle) <= 64),
  constraint vq_p02_x_handle_max check (char_length(x_handle) <= 64)
);

-- Remove the existing public ALL policy and table-wide writes.
alter table public.profiles enable row level security;
drop policy if exists "Public access policy for profiles" on public.profiles;
drop policy if exists "vq_public_profile_read" on public.profiles;
drop policy if exists "vq_owner_profile_update" on public.profiles;
revoke all privileges on public.profiles from public, anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant update (display_name, photo_url, bio, interests, languages, city, area, cultural_identity, vibe_preferences)
  on public.profiles to authenticated;
create policy "vq_public_profile_read" on public.profiles
  for select to anon, authenticated using (true);
create policy "vq_owner_profile_update" on public.profiles
  for update to authenticated
  using (
    id = 'usr_' || (select auth.uid())::text
    or exists (select 1 from public.s00_test_identity_links l
      where l.auth_user_id = (select auth.uid()) and l.legacy_profile_id = profiles.id)
  )
  with check (
    id = 'usr_' || (select auth.uid())::text
    or exists (select 1 from public.s00_test_identity_links l
      where l.auth_user_id = (select auth.uid()) and l.legacy_profile_id = profiles.id)
  );

-- Private preferences never belong on public.profiles.
alter table public.profile_preferences enable row level security;
revoke all privileges on public.profile_preferences from public, anon, authenticated;
grant select, insert on public.profile_preferences to authenticated;
grant update (
  telegram_handle, x_handle, preferred_contact_method, locale, theme,
  privacy, notifications, accessibility, cozy_diary_mode, polar_romance_opt_in
) on public.profile_preferences to authenticated;
create policy "vq_p02_preferences_read" on public.profile_preferences
  for select to authenticated using (
    profile_id = 'usr_' || (select auth.uid())::text
    or exists (select 1 from public.s00_test_identity_links l
      where l.auth_user_id = (select auth.uid()) and l.legacy_profile_id = profile_preferences.profile_id)
  );
create policy "vq_p02_preferences_insert" on public.profile_preferences
  for insert to authenticated with check (
    profile_id = 'usr_' || (select auth.uid())::text
    or exists (select 1 from public.s00_test_identity_links l
      where l.auth_user_id = (select auth.uid()) and l.legacy_profile_id = profile_preferences.profile_id)
  );
create policy "vq_p02_preferences_update" on public.profile_preferences
  for update to authenticated using (
    profile_id = 'usr_' || (select auth.uid())::text
    or exists (select 1 from public.s00_test_identity_links l
      where l.auth_user_id = (select auth.uid()) and l.legacy_profile_id = profile_preferences.profile_id)
  ) with check (
    profile_id = 'usr_' || (select auth.uid())::text
    or exists (select 1 from public.s00_test_identity_links l
      where l.auth_user_id = (select auth.uid()) and l.legacy_profile_id = profile_preferences.profile_id)
  );

-- Reconcile the Auth signup provisioning trigger from the existing S00 migration source.
create or replace function public.vq_provision_auth_profile()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare v_handle text; v_display text;
begin
  v_handle := lower(trim(coalesce(new.raw_user_meta_data->>'handle', '')));
  v_display := trim(coalesce(new.raw_user_meta_data->>'display_name', ''));
  if v_handle !~ '^[a-z0-9_]{3,32}$' or char_length(v_display) not between 1 and 80 then
    return new; -- OAuth or incomplete identities require explicit onboarding.
  end if;
  insert into public.profiles (id, handle, display_name, account_type)
  values ('usr_' || new.id::text, v_handle, v_display, 'vibe');
  return new;
end;
$$;
revoke execute on function public.vq_provision_auth_profile() from public, anon, authenticated;
drop trigger if exists vq_auth_provision_profile on auth.users;
create trigger vq_auth_provision_profile after insert on auth.users
  for each row execute function public.vq_provision_auth_profile();

commit;
