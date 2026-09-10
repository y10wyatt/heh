begin;
create table if not exists public.personal_tasks (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null check (length(title) between 1 and 120),
  category text not null check (category in ('body','mind','joy','everyday')),
  starred boolean not null default false,
  created_at timestamptz not null default now(),
  completion jsonb,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists personal_tasks_user_group_idx on public.personal_tasks(user_id,group_id,created_at);
alter table public.personal_tasks enable row level security;
revoke all on public.personal_tasks from anon,authenticated;
grant select on public.personal_tasks to authenticated;
drop policy if exists personal_tasks_owner_read on public.personal_tasks;
create policy personal_tasks_owner_read on public.personal_tasks for select to authenticated using (user_id=(select auth.uid()));
create or replace function public.our_place_save_task(
  p_id uuid,p_group_id uuid,p_title text,p_category text,p_starred boolean,p_completion jsonb,p_completed_at timestamptz
) returns public.personal_tasks language plpgsql security definer set search_path='' as $$
declare result public.personal_tasks;
begin
  if auth.uid() is null or not public.is_group_member(p_group_id) then raise exception 'not authorized'; end if;
  insert into public.personal_tasks(id,user_id,group_id,title,category,starred,completion,completed_at)
  values(p_id,auth.uid(),p_group_id,trim(p_title),p_category,coalesce(p_starred,false),p_completion,p_completed_at)
  on conflict(id) do update set title=excluded.title,category=excluded.category,starred=excluded.starred,completion=excluded.completion,completed_at=excluded.completed_at,updated_at=now()
  where personal_tasks.user_id=auth.uid() and personal_tasks.group_id=p_group_id
  returning * into result;
  if result.id is null then raise exception 'task belongs to another account'; end if;
  return result;
end; $$;
revoke all on function public.our_place_save_task(uuid,uuid,text,text,boolean,jsonb,timestamptz) from public,anon;
grant execute on function public.our_place_save_task(uuid,uuid,text,text,boolean,jsonb,timestamptz) to authenticated;
do $$ begin
  if not exists (select 1 from pg_publication_rel pr join pg_class c on c.oid=pr.prrelid join pg_publication p on p.oid=pr.prpubid where p.pubname='supabase_realtime' and c.oid='public.personal_tasks'::regclass) then alter publication supabase_realtime add table public.personal_tasks; end if;
exception when undefined_object then null; end $$;
commit;
