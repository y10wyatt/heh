-- LOCAL PROPOSAL ONLY. Review before applying to the shared Supabase project.
create schema if not exists sibling_private;
revoke all on schema sibling_private from public, anon;
grant usage on schema sibling_private to authenticated;

create table public.profiles(id uuid primary key references auth.users(id) on delete cascade,display_name text not null,avatar_url text,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.challenge_groups(id uuid primary key default gen_random_uuid(),name text not null,timezone text not null default 'America/Vancouver',minimum_daily_events int not null default 1 check(minimum_daily_events>=0),created_at timestamptz not null default now());
create table public.challenge_group_members(challenge_group_id uuid references public.challenge_groups on delete cascade,user_id uuid references auth.users on delete cascade,joined_at timestamptz not null default now(),primary key(challenge_group_id,user_id));
create table public.action_events(id uuid primary key,user_id uuid not null references auth.users,challenge_group_id uuid references public.challenge_groups,source_app text not null check(source_app in('sibling_showdown','life_dashboard')),category text,action_type text not null check(action_type in('action_completed','action_missed','challenge_created','challenge_accepted','challenge_completed','challenge_disputed')),title text not null,value numeric,unit text,occurred_at timestamptz not null,created_at timestamptz not null default now(),visibility text not null check(visibility in('private','challenge_group')),external_reference jsonb, schema_version int not null default 1 check(schema_version=1),metadata jsonb not null default '{}');
create table public.challenges(id uuid primary key default gen_random_uuid(),challenge_group_id uuid not null references public.challenge_groups,creator_id uuid not null references auth.users,target_user_id uuid not null references auth.users,title text not null,status text not null check(status in('issued','accepted','completed','disputed')),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.point_rules(id uuid primary key default gen_random_uuid(),challenge_group_id uuid not null references public.challenge_groups,version int not null,action_type text not null,category text,points numeric not null,active boolean not null default true,created_at timestamptz not null default now(),unique(challenge_group_id,id,version));
create table public.comments(id uuid primary key default gen_random_uuid(),challenge_group_id uuid not null references public.challenge_groups,author_id uuid not null references auth.users,challenge_id uuid references public.challenges,action_event_id uuid references public.action_events,room_action_id uuid,body text not null,created_at timestamptz not null default now(),check(num_nonnulls(challenge_id,action_event_id,room_action_id)=1));
create table public.rooms(id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users,challenge_group_id uuid not null references public.challenge_groups,name text not null,theme text not null check(theme in('cozy_cabin','workshop','sky_room','chaos')),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(owner_id,challenge_group_id));
create table public.room_items(id uuid primary key default gen_random_uuid(),name text not null,item_type text not null,rarity text not null check(rarity in('common','rare','weekly')),effect_type text,metadata jsonb not null default '{}');
create table public.room_slots(id uuid primary key default gen_random_uuid(),room_id uuid not null references public.rooms on delete cascade,slot_key text not null,slot_type text not null,current_item_id uuid references public.room_items,is_protected boolean not null default false,updated_by uuid references auth.users,updated_at timestamptz,unique(room_id,slot_key));
create table public.room_action_entitlements(id uuid primary key default gen_random_uuid(),challenge_group_id uuid not null references public.challenge_groups,user_id uuid not null references auth.users,target_user_id uuid not null references auth.users,entitlement_type text not null check(entitlement_type in('mischief','defense')),source_date date not null,source_event_id uuid,used_at timestamptz,expires_at timestamptz,created_at timestamptz not null default now(),unique(challenge_group_id,user_id,source_date,entitlement_type));
create table public.room_actions(id uuid primary key,target_room_id uuid not null references public.rooms,actor_id uuid not null references auth.users,challenge_group_id uuid not null references public.challenge_groups,action_type text not null,result text not null,slot_id uuid references public.room_slots,item_id uuid references public.room_items,entitlement_id uuid references public.room_action_entitlements,source_event_id uuid,created_at timestamptz not null default now(),expires_at timestamptz,metadata jsonb not null default '{}');
alter table public.comments add constraint comments_room_action_fk foreign key(room_action_id) references public.room_actions;
create table public.room_traps(id uuid primary key default gen_random_uuid(),room_id uuid not null references public.rooms,slot_id uuid not null references public.room_slots,trap_type text not null,status text not null check(status in('active','triggered','expired','disabled')),created_by uuid not null references auth.users,expires_at timestamptz,created_at timestamptz not null default now());
create table public.daily_results(id uuid primary key default gen_random_uuid(),challenge_group_id uuid not null references public.challenge_groups,local_date date not null,scores jsonb not null,applied_rules jsonb not null,tie boolean not null,created_at timestamptz not null default now(),unique(challenge_group_id,local_date));
create index action_events_group_time on public.action_events(challenge_group_id,occurred_at desc);
create index action_events_user_time on public.action_events(user_id,occurred_at desc);
create index challenges_group on public.challenges(challenge_group_id,created_at desc);
create index point_rules_group_match on public.point_rules(challenge_group_id,action_type,category,version desc)where active;
create index comments_group on public.comments(challenge_group_id,created_at desc);
create index rooms_group on public.rooms(challenge_group_id);
create index room_slots_room on public.room_slots(room_id);
create index room_actions_group_time on public.room_actions(challenge_group_id,created_at desc);
create index room_actions_room_time on public.room_actions(target_room_id,created_at desc);
create index entitlements_unused on public.room_action_entitlements(user_id,used_at) where used_at is null;
create index room_traps_active on public.room_traps(room_id,status,expires_at);

create or replace function sibling_private.is_member(g uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.challenge_group_members m where m.challenge_group_id=g and m.user_id=(select auth.uid()))$$;
revoke all on function sibling_private.is_member(uuid) from public,anon,authenticated;

alter table public.profiles enable row level security;alter table public.challenge_groups enable row level security;alter table public.challenge_group_members enable row level security;alter table public.action_events enable row level security;alter table public.challenges enable row level security;alter table public.point_rules enable row level security;alter table public.comments enable row level security;alter table public.rooms enable row level security;alter table public.room_slots enable row level security;alter table public.room_items enable row level security;alter table public.room_actions enable row level security;alter table public.room_action_entitlements enable row level security;alter table public.room_traps enable row level security;alter table public.daily_results enable row level security;
create policy profiles_self on public.profiles for all to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy groups_member_read on public.challenge_groups for select to authenticated using(sibling_private.is_member(id));
create policy members_group_read on public.challenge_group_members for select to authenticated using(sibling_private.is_member(challenge_group_id));
create policy events_read on public.action_events for select to authenticated using(user_id=(select auth.uid()) or (visibility='challenge_group' and sibling_private.is_member(challenge_group_id)));
create policy events_own_insert on public.action_events for insert to authenticated with check(user_id=(select auth.uid()) and (challenge_group_id is null or sibling_private.is_member(challenge_group_id)));
create policy challenges_group on public.challenges for select to authenticated using(sibling_private.is_member(challenge_group_id));
create policy rules_group on public.point_rules for select to authenticated using(sibling_private.is_member(challenge_group_id));
create policy comments_group on public.comments for select to authenticated using(sibling_private.is_member(challenge_group_id));
create policy comments_own_insert on public.comments for insert to authenticated with check(author_id=(select auth.uid()) and sibling_private.is_member(challenge_group_id));
create policy rooms_group_read on public.rooms for select to authenticated using(sibling_private.is_member(challenge_group_id));
create policy slots_group_read on public.room_slots for select to authenticated using(exists(select 1 from public.rooms r where r.id=room_id and sibling_private.is_member(r.challenge_group_id)));
create policy items_auth_read on public.room_items for select to authenticated using(true);
create policy room_actions_group_read on public.room_actions for select to authenticated using(sibling_private.is_member(challenge_group_id));
create policy entitlements_group_read on public.room_action_entitlements for select to authenticated using(user_id=(select auth.uid()) or target_user_id=(select auth.uid()));
create policy traps_owner_read on public.room_traps for select to authenticated using(exists(select 1 from public.rooms r where r.id=room_id and (r.owner_id=(select auth.uid()) or sibling_private.is_member(r.challenge_group_id))));
create policy results_group_read on public.daily_results for select to authenticated using(sibling_private.is_member(challenge_group_id));

-- These functions are the only client mutation path for daily rewards and raids.
create or replace function sibling_private.finalize_day(p_group_id uuid,p_now timestamptz default now()) returns public.daily_results language plpgsql security definer set search_path='' as $$
declare d date;tz text;minimum_events int;result public.daily_results;scores jsonb;breakdown jsonb;is_tie boolean;eligible boolean;winner_id uuid;loser_id uuid;
begin
 if (select auth.uid()) is null or not sibling_private.is_member(p_group_id) then raise exception 'not authorized';end if;
 select timezone,minimum_daily_events into tz,minimum_events from public.challenge_groups where id=p_group_id for update;
 if not found then raise exception 'group not found';end if;
 d:=(p_now at time zone tz)::date;
 select * into result from public.daily_results where challenge_group_id=p_group_id and local_date=d;
 if found then return result;end if;
 with matched as(
  select e.id event_id,e.user_id,coalesce(r.points,0) points,r.id rule_id,r.version
  from public.action_events e left join lateral(
   select pr.id,pr.version,pr.points from public.point_rules pr
   where pr.challenge_group_id=p_group_id and pr.active and pr.action_type=e.action_type and(pr.category is null or pr.category=e.category)
   order by pr.version desc limit 1
  )r on true where e.challenge_group_id=p_group_id and(e.occurred_at at time zone tz)::date=d
 ),totals as(select user_id,sum(points) total,count(*) event_count from matched group by user_id)
 select coalesce((select jsonb_object_agg(user_id,total) from totals),'{}'::jsonb),
        coalesce((select jsonb_agg(jsonb_build_object('eventId',event_id,'userId',user_id,'ruleId',rule_id,'ruleVersion',version,'points',points) order by event_id) from matched),'[]'::jsonb),
        (select count(*)=2 and min(total)=max(total) from totals),
        (select count(*)=2 and bool_and(event_count>=minimum_events) from totals)
 into scores,breakdown,is_tie,eligible;
 is_tie:=coalesce(is_tie,false);eligible:=coalesce(eligible,false);
 insert into public.daily_results(challenge_group_id,local_date,scores,applied_rules,tie) values(p_group_id,d,scores,breakdown,is_tie) returning * into result;
 if eligible then
  if is_tie then
   insert into public.room_action_entitlements(challenge_group_id,user_id,target_user_id,entitlement_type,source_date)
   select p_group_id,m.user_id,m.user_id,'defense',d from public.challenge_group_members m where m.challenge_group_id=p_group_id
   on conflict(challenge_group_id,user_id,source_date,entitlement_type)do nothing;
  else
   select key::uuid into winner_id from jsonb_each_text(scores) order by value::numeric desc,key limit 1;
   select user_id into loser_id from public.challenge_group_members where challenge_group_id=p_group_id and user_id<>winner_id limit 1;
   insert into public.room_action_entitlements(challenge_group_id,user_id,target_user_id,entitlement_type,source_date)
   values(p_group_id,winner_id,loser_id,'mischief',d),(p_group_id,loser_id,loser_id,'defense',d)
   on conflict(challenge_group_id,user_id,source_date,entitlement_type)do nothing;
  end if;
 end if;
 return result;
end$$;
create or replace function sibling_private.apply_room_action(p_entitlement_id uuid,p_target_room_id uuid,p_slot_id uuid,p_item_id uuid,p_action_type text) returns public.room_actions language plpgsql security definer set search_path='' as $$
declare actor uuid:=(select auth.uid());e public.room_action_entitlements;r public.rooms;s public.room_slots;t public.room_traps;a public.room_actions;outcome text:='applied';details jsonb:='{}';
begin
 if actor is null then raise exception 'not authenticated';end if;
 select * into e from public.room_action_entitlements where id=p_entitlement_id and user_id=actor and used_at is null and(expires_at is null or expires_at>now()) for update;
 if not found then raise exception 'invalid entitlement';end if;
 if not sibling_private.is_member(e.challenge_group_id) then raise exception 'not a group member';end if;
 select * into r from public.rooms where id=p_target_room_id and challenge_group_id=e.challenge_group_id for update;
 if not found then raise exception 'invalid target';end if;
 if(e.entitlement_type='mischief' and(r.owner_id<>e.target_user_id or r.owner_id=actor))or(e.entitlement_type='defense' and r.owner_id<>actor)then raise exception 'entitlement cannot target this room';end if;
 if(e.entitlement_type='mischief' and p_action_type not in('prank','paint','decorate'))or(e.entitlement_type='defense' and p_action_type not in('set_trap','defend'))then raise exception 'action not allowed by entitlement';end if;
 select * into s from public.room_slots where id=p_slot_id and room_id=r.id for update;
 if not found then raise exception 'invalid slot';end if;
 if s.is_protected and e.entitlement_type='mischief' then outcome:='blocked';end if;
 if outcome='applied' and e.entitlement_type='mischief' then
  select * into t from public.room_traps where room_id=r.id and status='active' and(expires_at is null or expires_at>now()) and(slot_id=s.id or trap_type in('decoy_object','mirror_trap')) order by created_at limit 1 for update;
  if found then
   update public.room_traps set status='triggered' where id=t.id;
   details:=jsonb_build_object('trapId',t.id,'trapType',t.trap_type);
   if t.trap_type in('glue_trap','lock_trap')then outcome:='trap_triggered';
   elsif t.trap_type='mirror_trap'then outcome:='reflected';
   elsif t.trap_type='decoy_object'then outcome:='trap_triggered';
   elsif t.trap_type='alarm_bell'then details:=details||'{"revealed":true}'::jsonb;
   end if;
  end if;
 end if;
 update public.room_action_entitlements set used_at=now() where id=e.id;
 insert into public.room_actions(id,target_room_id,actor_id,challenge_group_id,action_type,result,slot_id,item_id,entitlement_id,metadata)
 values(gen_random_uuid(),r.id,actor,r.challenge_group_id,p_action_type,outcome,s.id,p_item_id,e.id,details) returning * into a;
 if outcome='applied' and p_item_id is not null then update public.room_slots set current_item_id=p_item_id,updated_by=actor,updated_at=now() where id=s.id;end if;
 return a;
end$$;
create or replace function public.finalize_day(p_group_id uuid,p_now timestamptz default now())returns public.daily_results language sql security invoker set search_path='' as $$select sibling_private.finalize_day(p_group_id,p_now)$$;
create or replace function public.apply_room_action(p_entitlement_id uuid,p_target_room_id uuid,p_slot_id uuid,p_item_id uuid,p_action_type text)returns public.room_actions language sql security invoker set search_path='' as $$select sibling_private.apply_room_action(p_entitlement_id,p_target_room_id,p_slot_id,p_item_id,p_action_type)$$;
revoke all on function sibling_private.finalize_day(uuid,timestamptz),sibling_private.apply_room_action(uuid,uuid,uuid,uuid,text),public.finalize_day(uuid,timestamptz),public.apply_room_action(uuid,uuid,uuid,uuid,text) from public,anon;
grant execute on function sibling_private.finalize_day(uuid,timestamptz),sibling_private.apply_room_action(uuid,uuid,uuid,uuid,text),public.finalize_day(uuid,timestamptz),public.apply_room_action(uuid,uuid,uuid,uuid,text) to authenticated;
grant select,insert on public.action_events to authenticated;grant select on public.challenge_groups,public.challenge_group_members,public.point_rules,public.rooms,public.room_slots,public.room_items,public.room_actions,public.room_action_entitlements,public.room_traps,public.daily_results to authenticated;grant select,insert on public.comments to authenticated;
