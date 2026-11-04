-- VQgemni P03: Social post author ownership and legacy identity preservation.
-- SQL Editor execution candidate. Review and back up current policies/data first.
-- IMPORTANT: This migration deliberately preserves s00_test_identity_links.
-- NEVER equate a public handle or user-editable Auth metadata with authorization.
-- This replaces the unsafe, uninstalled 20261104053000 retirement proposal.
begin;

do $$
begin
  if to_regclass('public.s00_test_identity_links') is null then
    raise exception 'P03 requires the existing verified identity links; aborting';
  end if;
end $$;

alter table public.social_posts enable row level security;

-- Existing unrestricted ALL policy allowed anonymous writes and author spoofing.
drop policy if exists "Public access policy for social_posts" on public.social_posts;

-- Public feed discovery is read-only; only signed-in owners can publish.
create policy "p03_public_post_read" on public.social_posts
  for select to anon, authenticated using (true);

create policy "p03_verified_post_create" on public.social_posts
  for insert to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = social_posts.user_id
        and (
          p.id = 'usr_' || (select auth.uid())::text
          or p.id = (select auth.uid())::text
          or exists (
            select 1 from public.s00_test_identity_links l
            where l.auth_user_id = (select auth.uid())
              and l.legacy_profile_id = p.id
          )
        )
    )
  );

-- Revoke old table-level anonymous writes, updates, deletes and bypass-capable
-- privileges. This table is written only by the authenticated creator for now.
revoke all privileges on public.social_posts from public, anon, authenticated;
grant select on public.social_posts to anon, authenticated;
grant insert on public.social_posts to authenticated;

commit;

-- Read-only follow-up verification (execute separately):
-- select policyname, cmd, roles, qual, with_check
-- from pg_policies where schemaname='public' and tablename='social_posts';
-- select grantee, privilege_type from information_schema.role_table_grants
-- where table_schema='public' and table_name='social_posts'
-- and grantee in ('anon','authenticated') order by grantee, privilege_type;
-- select count(*) from public.s00_test_identity_links;
