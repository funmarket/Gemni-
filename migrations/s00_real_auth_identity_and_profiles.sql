-- VQgemni S00/S02: separate Auth UUIDs from canonical display names and @handles.
-- Preserve all existing profile IDs and post references. No Auth accounts are created.
-- Attach only exact test-email matches; never attach Hannibal.
begin;

-- Use the existing FK-backed identity link table created by the earlier operator SQL.
revoke all on public.s00_test_identity_links from public, anon, authenticated;
grant select on public.s00_test_identity_links to authenticated;
drop policy if exists "vq_owner_read_identity_links" on public.s00_test_identity_links;
create policy "vq_owner_read_identity_links" on public.s00_test_identity_links
  for select to authenticated using (auth_user_id = (select auth.uid()));

-- Existing public-access policy allowed unauthenticated profile writes.
drop policy if exists "Public access policy for profiles" on public.profiles;
revoke all on public.profiles from public, anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant update (display_name, photo_url) on public.profiles to authenticated;
create policy "vq_public_profile_read" on public.profiles for select to anon, authenticated using (true);
create policy "vq_owner_profile_update" on public.profiles for update to authenticated
  using (
    id = 'usr_' || (select auth.uid())::text
    or exists (select 1 from public.s00_test_identity_links l where l.auth_user_id = (select auth.uid()) and l.legacy_profile_id = profiles.id)
  )
  with check (
    id = 'usr_' || (select auth.uid())::text
    or exists (select 1 from public.s00_test_identity_links l where l.auth_user_id = (select auth.uid()) and l.legacy_profile_id = profiles.id)
  );

-- New signups get a canonical profile at identity creation time.
-- Trigger executes in private auth schema; does not grant public insert privileges.
create or replace function public.vq_provision_auth_profile()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  v_handle text;
  v_display text;
begin
  v_handle := lower(trim(coalesce(new.raw_user_meta_data->>'handle','')));
  v_display := trim(coalesce(new.raw_user_meta_data->>'display_name',''));
  if v_handle !~ '^[a-z0-9_]{3,32}$' or length(v_display) not between 1 and 80 then
    return new; -- OAuth users must finish onboarding; no fabricated usernames.
  end if;
  insert into public.profiles (id,handle,display_name,account_type)
  values ('usr_' || new.id::text,v_handle,v_display,'vibe');
  return new;
end;
$$;
revoke execute on function public.vq_provision_auth_profile() from public, anon, authenticated;
drop trigger if exists vq_auth_provision_profile on auth.users;
create trigger vq_auth_provision_profile after insert on auth.users
  for each row execute function public.vq_provision_auth_profile();

-- The Product Owner's deterministic historic test-email convention.
-- Only confirmed exact matches can be linked. Existing historical IDs remain unchanged.
create temporary table vq_s00_expected (
  legacy_id text primary key, handle text unique not null, display_name text not null, expected_email text unique not null
) on commit drop;
insert into vq_s00_expected (legacy_id,handle,display_name,expected_email) values
 ('usr_elena_sf','elena_urbanwalks','Elena Rostova','elenarostova@elenaurbanwalks.com'),
 ('usr_hana_tunis','hana_locallens','Hana Khelil','hanakhelil@hanalocallens.com'),
 ('usr_leo_sf','leo_skatehikes','Leo Marquez','leomarquez@leoskatehikes.com'),
 ('usr_malik_tunis','malik_medina','Malik Ben Youssef','malikbenyoussef@malikmedina.com'),
 ('usr_marcus_oakland','marcus_audio','Marcus Vance (Local Legend)','marcusvance@marcusaudio.com'),
 ('usr_marcus_exp','marcus_tours_exp','Marcus Brody','marcusbrody@marcustoursexp.com'),
 ('usr_samira_sf','samira_hikes','Samira Mansour','samiramansour@samirahikes.com'),
 ('usr_sarah_carthage','sarah_carthage','Sarah K. (Coast Scout)','sarahkcoastscout@sarahcarthage.com'),
 ('usr_sarah_sf','sarah_scribe','Sarah Scribe','sarahscribe@sarahscribe.com'),
 ('usr_tariq_sf','tariq_soundscapes','Tariq Vance','tariqvance@tariqsoundscapes.com'),
 ('usr_youssef_explorer','youssef_scout','Youssef Explorer','youssefexplorer@youssefscout.com'),
 ('user_yassine','yassine_medina','Yassine B.','yassineb@yassinemedina.com'),
 ('user_malek','malek_sidibousaid','Malek D.','malekd@maleksidibousaid.com'),
 ('user_amina','amina_marsa','Amina T.','aminat@aminamarsa.com'),
 ('user_karim','karim_elmenzah','Karim R.','karimr@karimelmenzah.com'),
 ('usr_haight_vibe','haight_vibe','Haight Vibe','haightvibe@haightvibe.com'),
 ('usr_manga_fox','manga_fox','Manga Fox','mangafox@mangafox.com'),
 ('usr_sf_explorer','sf_explorer','SF Explorer','sfexplorer@sfexplorer.com'),
 ('usr_mission_soul','mission_soul','Mission Soul','missionsoul@missionsoul.com'),
 ('usr_acoustic_breeze','acoustic_breeze','Acoustic Breeze','acousticbreeze@acousticbreeze.com'),
 ('usr_zen_stroller','zen_stroller','Zen Stroller','zenstroller@zenstroller.com');

-- Abort on ambiguity: no name-based merging, no duplicate owner and no repurposing.
do $$
begin
  if exists (
    select 1 from vq_s00_expected e join public.profiles p on lower(p.handle)=lower(e.handle)
    where p.id <> e.legacy_id
  ) then raise exception 'Existing profile/handle collision. No identities linked'; end if;
  if exists (
    select 1 from vq_s00_expected e join public.profiles p on p.id=e.legacy_id
    where lower(p.handle)<>lower(e.handle)
  ) then raise exception 'Existing legacy ID/handle collision. No identities linked'; end if;
  if exists (
    select 1 from vq_s00_expected e join auth.users u on lower(u.email)=e.expected_email
    join public.s00_test_identity_links l on l.auth_user_id=u.id
    where l.legacy_profile_id<>e.legacy_id
  ) then raise exception 'Auth identity linked to different profile. No identities linked'; end if;
end $$;

-- New sample records only for authenticated exact matches. Existing 11 are not replaced.
insert into public.profiles(id,handle,display_name,account_type)
select e.legacy_id,e.handle,e.display_name,'vibe'
from vq_s00_expected e
join auth.users u on lower(u.email)=e.expected_email
where e.legacy_id not in (select id from public.profiles)
on conflict (id) do nothing;

insert into public.s00_test_identity_links(auth_user_id,legacy_profile_id,handle,cohort_id,source_refs)
select u.id,e.legacy_id,e.handle,'s00_vqgemini_20261103','["source:existing-vqgemini-identity","matching:owner-email-convention"]'::jsonb
from vq_s00_expected e
join auth.users u on lower(u.email)=e.expected_email
join public.profiles p on p.id=e.legacy_id and lower(p.handle)=e.handle
on conflict (auth_user_id) do nothing;

commit;
