begin;

-- Cross-device personal goal completions. Tasks remain client drafts for now;
-- their durable completion events live here and can be read by the household feed.
create table if not exists public.personal_action_events (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  source_app text not null default 'sibling_showdown',
  category text,
  action_type text not null check (action_type in ('action_completed', 'action_missed')),
  title text not null check (length(title) between 1 and 160),
  value numeric,
  unit text,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  visibility text not null default 'challenge_group' check (visibility in ('private', 'challenge_group')),
  external_reference jsonb,
  schema_version integer not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  check (jsonb_typeof(metadata) = 'object')
);
create index if not exists personal_action_events_group_occurred_idx
  on public.personal_action_events(group_id, occurred_at desc);
create index if not exists personal_action_events_user_idx
  on public.personal_action_events(user_id, occurred_at desc);
alter table public.personal_action_events enable row level security;
revoke all on public.personal_action_events from anon, authenticated;
grant select on public.personal_action_events to authenticated;
drop policy if exists personal_action_events_read on public.personal_action_events;
create policy personal_action_events_read on public.personal_action_events for select to authenticated
  using (user_id = (select auth.uid()) or (visibility = 'challenge_group' and (select public.is_group_member(group_id))));

create or replace function public.our_place_log_personal_action(
  p_id uuid, p_group_id uuid, p_source_app text, p_category text,
  p_action_type text, p_title text, p_value numeric, p_unit text,
  p_occurred_at timestamptz, p_visibility text, p_external_reference jsonb,
  p_schema_version integer, p_metadata jsonb
) returns public.personal_action_events
language plpgsql security definer set search_path = '' as $$
declare result public.personal_action_events;
begin
  if auth.uid() is null or not public.is_group_member(p_group_id) then raise exception 'not authorized'; end if;
  insert into public.personal_action_events(
    id,user_id,group_id,source_app,category,action_type,title,value,unit,occurred_at,
    visibility,external_reference,schema_version,metadata
  ) values (
    p_id,auth.uid(),p_group_id,coalesce(nullif(trim(p_source_app),''),'sibling_showdown'),
    nullif(trim(p_category),''),p_action_type,trim(p_title),p_value,nullif(trim(p_unit),''),
    p_occurred_at,coalesce(p_visibility,'challenge_group'),p_external_reference,
    coalesce(p_schema_version,1),coalesce(p_metadata,'{}'::jsonb)
  ) on conflict (id) do update set metadata=excluded.metadata
  returning * into result;
  return result;
end; $$;

-- Visiting a room records that its newest surprise was seen on every device.
create or replace function public.our_place_set_action_state(p_id uuid, p_state text)
returns public.household_actions
language plpgsql security definer set search_path = '' as $$
declare result public.household_actions; caller_id uuid := auth.uid();
begin
  if caller_id is null or p_state not in ('discovered','reacted','tidied','kept') then raise exception 'invalid action state'; end if;
  update public.household_actions set state=p_state,
    discovered_at=case when p_state in ('discovered','reacted','tidied','kept') then coalesce(discovered_at,now()) else discovered_at end,
    resolved_at=case when p_state in ('tidied','kept') then coalesce(resolved_at,now()) else resolved_at end
  where id=p_id and (actor_id=caller_id or target_user_id=caller_id)
    and public.is_group_member(group_id)
  returning * into result;
  if result.id is null then raise exception 'action not found'; end if;
  return result;
end; $$;
revoke all on function public.our_place_log_personal_action(uuid,uuid,text,text,text,text,numeric,text,timestamptz,text,jsonb,integer,jsonb) from public, anon;
revoke all on function public.our_place_set_action_state(uuid,text) from public, anon;
grant execute on function public.our_place_log_personal_action(uuid,uuid,text,text,text,text,numeric,text,timestamptz,text,jsonb,integer,jsonb) to authenticated;
grant execute on function public.our_place_set_action_state(uuid,text) to authenticated;

-- Enable live updates when the project has not already added these relations.
do $$ begin
  if not exists (select 1 from pg_publication_rel pr join pg_class c on c.oid=pr.prrelid join pg_publication p on p.oid=pr.prpubid where p.pubname='supabase_realtime' and c.oid='public.household_actions'::regclass) then
    alter publication supabase_realtime add table public.household_actions;
  end if;
  if not exists (select 1 from pg_publication_rel pr join pg_class c on c.oid=pr.prrelid join pg_publication p on p.oid=pr.prpubid where p.pubname='supabase_realtime' and c.oid='public.household_rooms'::regclass) then
    alter publication supabase_realtime add table public.household_rooms;
  end if;
  if not exists (select 1 from pg_publication_rel pr join pg_class c on c.oid=pr.prrelid join pg_publication p on p.oid=pr.prpubid where p.pubname='supabase_realtime' and c.oid='public.personal_action_events'::regclass) then
    alter publication supabase_realtime add table public.personal_action_events;
  end if;
exception when undefined_object then null;
end $$;

commit;
