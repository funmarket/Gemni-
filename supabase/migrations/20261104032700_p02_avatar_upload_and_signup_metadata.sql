-- Already applied to live Supabase as 20261104032700 on 2026-11-04.
-- Public-facing avatars are in a dedicated bucket, separate from private user media.
begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('avatars','avatars',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
drop policy if exists vq_p02_avatars_public_read on storage.objects;
drop policy if exists vq_p02_avatars_owner_insert on storage.objects;
create policy vq_p02_avatars_public_read on storage.objects
for select to anon,authenticated
using (bucket_id='avatars');
create policy vq_p02_avatars_owner_insert on storage.objects
for insert to authenticated
with check (
  bucket_id='avatars'
  and (select auth.uid()) is not null
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
create or replace function private.vq_provision_auth_profile()
returns trigger language plpgsql security definer set search_path=''
as $$
declare
  v_handle text;
  v_display text;
  v_photo text;
  v_bio text;
  v_city text;
  v_interests text[];
  v_contact text;
  v_x text;
  v_telegram text;
  v_cozy boolean;
  v_id text;
begin
  v_handle := lower(trim(coalesce(new.raw_user_meta_data->>'handle','')));
  v_display := trim(coalesce(new.raw_user_meta_data->>'display_name',''));
  if v_handle !~ '^[a-z0-9_]{3,32}$' or char_length(v_display) not between 1 and 80 then
    return new;
  end if;
  v_photo := left(trim(coalesce(new.raw_user_meta_data->>'photo_url','')),2048);
  if v_photo <> '' and v_photo !~* '^https?://' then v_photo := ''; end if;
  v_bio := left(trim(coalesce(new.raw_user_meta_data->>'bio','')),280);
  v_city := left(trim(coalesce(new.raw_user_meta_data->>'city','')),100);
  v_interests := array(
    select lower(left(trim(value),60))
    from jsonb_array_elements_text(
      case when jsonb_typeof(new.raw_user_meta_data->'interests')='array'
      then new.raw_user_meta_data->'interests' else '[]'::jsonb end
    ) as value
    where trim(value)<>''
    limit 30
  );
  v_telegram := left(trim(coalesce(new.raw_user_meta_data->>'telegram_handle','')),64);
  v_x := left(trim(coalesce(new.raw_user_meta_data->>'x_handle','')),64);
  v_contact := coalesce(new.raw_user_meta_data->>'preferred_contact_method','none');
  if v_contact not in ('none','telegram','x','email') then v_contact:='none'; end if;
  v_cozy := coalesce(new.raw_user_meta_data->>'cozy_diary_mode','false')='true';
  v_id := 'usr_'||new.id::text;
  insert into public.profiles(id,handle,display_name,account_type,photo_url,bio,city,interests)
  values (v_id,v_handle,v_display,'vibe',nullif(v_photo,''),v_bio,v_city,v_interests);
  insert into public.profile_preferences(profile_id,telegram_handle,x_handle,preferred_contact_method,cozy_diary_mode)
  values (v_id,v_telegram,v_x,v_contact,v_cozy);
  return new;
end;
$$;
revoke all on function private.vq_provision_auth_profile() from public,anon,authenticated;
commit;
