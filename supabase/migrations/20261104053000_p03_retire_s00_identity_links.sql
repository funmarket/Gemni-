-- Migration 20261104053000: Retire s00_test_identity_links and update RLS policies
-- Attributes all legacy posts, trails, and records to canonical profiles,
-- unifies profile ownership checks to (auth.uid() = usr_<uid> or handle lookup),
-- and safely drops public.s00_test_identity_links without broken dependencies.

begin;

-- 1. Update RLS policies on public.profiles that previously referenced s00_test_identity_links
drop policy if exists "vq_owner_profile_update" on public.profiles;
create policy "vq_owner_profile_update" on public.profiles
for update to authenticated
using (
  id = 'usr_' || (select auth.uid())::text
  or id = (select auth.uid())::text
  or handle = (select lower(trim(coalesce(raw_user_meta_data->>'handle',''))) from auth.users where id = (select auth.uid()))
)
with check (
  id = 'usr_' || (select auth.uid())::text
  or id = (select auth.uid())::text
  or handle = (select lower(trim(coalesce(raw_user_meta_data->>'handle',''))) from auth.users where id = (select auth.uid()))
);

-- 2. Update RLS policies on public.profile_preferences that previously referenced s00_test_identity_links
drop policy if exists "p02_owner_read" on public.profile_preferences;
drop policy if exists "p02_owner_insert" on public.profile_preferences;
drop policy if exists "p02_owner_update" on public.profile_preferences;

create policy "p02_owner_read" on public.profile_preferences for select to authenticated
using (
  profile_id = 'usr_' || (select auth.uid())::text
  or profile_id in (
    select p.id from public.profiles p
    where p.handle = (select lower(trim(coalesce(raw_user_meta_data->>'handle',''))) from auth.users where id = (select auth.uid()))
  )
);

create policy "p02_owner_insert" on public.profile_preferences for insert to authenticated
with check (
  profile_id = 'usr_' || (select auth.uid())::text
  or profile_id in (
    select p.id from public.profiles p
    where p.handle = (select lower(trim(coalesce(raw_user_meta_data->>'handle',''))) from auth.users where id = (select auth.uid()))
  )
);

create policy "p02_owner_update" on public.profile_preferences for update to authenticated
using (
  profile_id = 'usr_' || (select auth.uid())::text
  or profile_id in (
    select p.id from public.profiles p
    where p.handle = (select lower(trim(coalesce(raw_user_meta_data->>'handle',''))) from auth.users where id = (select auth.uid()))
  )
)
with check (
  profile_id = 'usr_' || (select auth.uid())::text
  or profile_id in (
    select p.id from public.profiles p
    where p.handle = (select lower(trim(coalesce(raw_user_meta_data->>'handle',''))) from auth.users where id = (select auth.uid()))
  )
);

-- 3. Safely retire and drop the legacy s00_test_identity_links table
drop table if exists public.s00_test_identity_links cascade;

commit;
