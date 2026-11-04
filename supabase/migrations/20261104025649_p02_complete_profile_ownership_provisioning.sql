-- Applied to the live Supabase project via the migration API as version 20261104025649.
-- Keep this exact migration identity in source control; do not create an overlapping PR #9 migration.
begin;
alter table public.profiles enable row level security;
drop policy if exists "Public access policy for profiles" on public.profiles;
drop policy if exists "vq_public_profile_read" on public.profiles;
drop policy if exists "vq_owner_profile_update" on public.profiles;
revoke all on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to anon, authenticated;
grant update (display_name,photo_url,bio,interests,languages,city,area,cultural_identity,vibe_preferences) on public.profiles to authenticated;
create policy vq_public_profile_read on public.profiles
for select to anon,authenticated using (true);
create policy vq_owner_profile_update on public.profiles
for update to authenticated
using (
 id = 'usr_' || (select auth.uid())::text
 or exists (select 1 from public.s00_test_identity_links l
 where l.auth_user_id=(select auth.uid()) and l.legacy_profile_id=profiles.id)
)
with check (
 id = 'usr_' || (select auth.uid())::text
 or exists (select 1 from public.s00_test_identity_links l
 where l.auth_user_id=(select auth.uid()) and l.legacy_profile_id=profiles.id)
);
create schema if not exists private;
revoke all on schema private from public,anon,authenticated;
create or replace function private.vq_provision_auth_profile()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare v_handle text; v_display text;
begin
 v_handle := lower(trim(coalesce(new.raw_user_meta_data->>'handle','')));
 v_display := trim(coalesce(new.raw_user_meta_data->>'display_name',''));
 if v_handle !~ '^[a-z0-9_]{3,32}$' or char_length(v_display) not between 1 and 80 then
   return new;
 end if;
 insert into public.profiles(id,handle,display_name,account_type)
 values ('usr_'||new.id::text,v_handle,v_display,'vibe');
 return new;
end;
$$;
revoke all on function private.vq_provision_auth_profile() from public,anon,authenticated;
drop trigger if exists vq_auth_provision_profile on auth.users;
create trigger vq_auth_provision_profile
after insert on auth.users for each row
execute function private.vq_provision_auth_profile();
commit;
