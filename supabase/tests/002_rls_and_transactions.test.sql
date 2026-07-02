begin;
select plan(19);

insert into auth.users(id,email) values
 ('00000000-0000-4000-8000-000000000001','william@test.local'),
 ('00000000-0000-4000-8000-000000000002','sister@test.local'),
 ('00000000-0000-4000-8000-000000000003','outsider@test.local');

insert into public.challenge_groups(id,name,timezone,minimum_daily_events)
values('00000000-0000-4000-8000-000000000010','Test siblings','America/Vancouver',1);
insert into public.challenge_group_members(challenge_group_id,user_id) values
 ('00000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000001'),
 ('00000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000002');
insert into public.point_rules(id,challenge_group_id,version,action_type,points) values
 ('00000000-0000-4000-8000-000000000020','00000000-0000-4000-8000-000000000010',1,'action_completed',2);
insert into public.action_events(id,user_id,challenge_group_id,source_app,action_type,title,occurred_at,visibility) values
 ('00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000010','sibling_showdown','action_completed','William one','2026-07-01 12:00:00+00','challenge_group'),
 ('00000000-0000-4000-8000-000000000102','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000010','sibling_showdown','action_completed','William two','2026-07-01 13:00:00+00','challenge_group'),
 ('00000000-0000-4000-8000-000000000103','00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000010','sibling_showdown','action_completed','Sister one','2026-07-01 12:00:00+00','challenge_group'),
 ('00000000-0000-4000-8000-000000000104','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000010','sibling_showdown','action_completed','William private','2026-07-01 14:00:00+00','private');
insert into public.rooms(id,owner_id,challenge_group_id,name,theme) values
 ('00000000-0000-4000-8000-000000000201','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000010','William room','workshop'),
 ('00000000-0000-4000-8000-000000000202','00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000010','Sister room','sky_room');
insert into public.room_items(id,name,item_type,rarity) values
 ('00000000-0000-4000-8000-000000000301','Tiny flag','sticker','common');
insert into public.room_slots(id,room_id,slot_key,slot_type,is_protected) values
 ('00000000-0000-4000-8000-000000000401','00000000-0000-4000-8000-000000000202','shelf','decor',false),
 ('00000000-0000-4000-8000-000000000402','00000000-0000-4000-8000-000000000202','bed','furniture',true);

set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select is((select count(*) from public.action_events),4::bigint,'William sees group events and own private event');
select lives_ok(
 $$insert into public.action_events(id,user_id,source_app,action_type,title,occurred_at,visibility)
 values('00000000-0000-4000-8000-000000000105','00000000-0000-4000-8000-000000000001','sibling_showdown','action_completed','Own insert',now(),'private')$$,
 'user can append own event'
);
select throws_ok(
 $$insert into public.action_events(id,user_id,source_app,action_type,title,occurred_at,visibility)
 values('00000000-0000-4000-8000-000000000106','00000000-0000-4000-8000-000000000002','sibling_showdown','action_completed','Forged insert',now(),'private')$$,
 '42501',null,'user cannot append another user event'
);
select lives_ok(
 $$select public.finalize_day('00000000-0000-4000-8000-000000000010','2026-07-01 20:00:00+00')$$,
 'group member can finalize the day'
);
select is((select count(*) from public.daily_results),1::bigint,'one daily result is created');
reset role;
select is((select count(*) from public.room_action_entitlements),2::bigint,'winner and loser rewards are created');
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select lives_ok(
 $$select public.finalize_day('00000000-0000-4000-8000-000000000010','2026-07-01 20:00:00+00')$$,
 'finalize retry returns safely'
);
reset role;
select is((select count(*) from public.room_action_entitlements),2::bigint,'finalize retry creates no duplicate rewards');
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select lives_ok(
 $$select public.apply_room_action(
  (select id from public.room_action_entitlements where user_id='00000000-0000-4000-8000-000000000001' and entitlement_type='mischief'),
  '00000000-0000-4000-8000-000000000202','00000000-0000-4000-8000-000000000401',
  '00000000-0000-4000-8000-000000000301','prank')$$,
 'winner can apply one authorized prank'
);
select is((select count(*) from public.room_actions where result='applied'),1::bigint,'room action is recorded once');
select ok((select used_at is not null from public.room_action_entitlements where user_id='00000000-0000-4000-8000-000000000001' and entitlement_type='mischief'),'mischief entitlement is consumed');
select throws_ok(
 $$select public.apply_room_action(
  (select id from public.room_action_entitlements where user_id='00000000-0000-4000-8000-000000000001' and entitlement_type='mischief' and source_date='2026-07-01'),
  '00000000-0000-4000-8000-000000000202','00000000-0000-4000-8000-000000000401',
  '00000000-0000-4000-8000-000000000301','prank')$$,
 'P0001','invalid entitlement','a consumed entitlement cannot be replayed'
);

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000003',true);
select is((select count(*) from public.action_events),0::bigint,'unrelated user cannot read group or private events');

reset role;
insert into public.action_events(id,user_id,challenge_group_id,source_app,action_type,title,occurred_at,visibility) values
 ('00000000-0000-4000-8000-000000000111','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000010','sibling_showdown','action_completed','William tie','2026-07-02 12:00:00+00','challenge_group'),
 ('00000000-0000-4000-8000-000000000112','00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000010','sibling_showdown','action_completed','Sister tie','2026-07-02 12:00:00+00','challenge_group');
insert into public.room_action_entitlements(id,challenge_group_id,user_id,target_user_id,entitlement_type,source_date)
values('00000000-0000-4000-8000-000000000501','00000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002','mischief','2026-07-03');
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select lives_ok(
 $$select public.apply_room_action(
  '00000000-0000-4000-8000-000000000501','00000000-0000-4000-8000-000000000202',
  '00000000-0000-4000-8000-000000000402','00000000-0000-4000-8000-000000000301','prank')$$,
 'protected-slot attempt returns an authoritative result'
);
select is((select result from public.room_actions where entitlement_id='00000000-0000-4000-8000-000000000501'),'blocked','protected slot blocks the prank');
select is((select current_item_id from public.room_slots where id='00000000-0000-4000-8000-000000000402'),null,'protected slot state remains unchanged');
select lives_ok(
 $$select public.finalize_day('00000000-0000-4000-8000-000000000010','2026-07-02 20:00:00+00')$$,
 'tie day finalizes'
);
select ok((select tie from public.daily_results where local_date='2026-07-02'),'equal scores are recorded as a tie');
reset role;
select is((select count(*) from public.room_action_entitlements where source_date='2026-07-02' and entitlement_type='defense'),2::bigint,'tie grants defense to both users');

select * from finish();
rollback;
