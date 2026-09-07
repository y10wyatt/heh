delete from public.room_actions where challenge_group_id='20000000-0000-4000-8000-000000000010';
delete from public.room_action_entitlements where challenge_group_id='20000000-0000-4000-8000-000000000010';
delete from public.room_slots where room_id='20000000-0000-4000-8000-000000000020';
delete from public.rooms where challenge_group_id='20000000-0000-4000-8000-000000000010';
delete from public.room_items where id='20000000-0000-4000-8000-000000000030';
delete from public.daily_results where challenge_group_id='20000000-0000-4000-8000-000000000010';
delete from public.action_events where challenge_group_id='20000000-0000-4000-8000-000000000010';
delete from public.point_rules where challenge_group_id='20000000-0000-4000-8000-000000000010';
delete from public.challenge_group_members where challenge_group_id='20000000-0000-4000-8000-000000000010';
delete from public.challenge_groups where id='20000000-0000-4000-8000-000000000010';
delete from auth.users where id in('20000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002');

insert into auth.users(id,email) values
 ('20000000-0000-4000-8000-000000000001','concurrent-a@test.local'),
 ('20000000-0000-4000-8000-000000000002','concurrent-b@test.local');
insert into public.challenge_groups(id,name,timezone,minimum_daily_events)
values('20000000-0000-4000-8000-000000000010','Concurrency test','America/Vancouver',1);
insert into public.challenge_group_members(challenge_group_id,user_id) values
 ('20000000-0000-4000-8000-000000000010','20000000-0000-4000-8000-000000000001'),
 ('20000000-0000-4000-8000-000000000010','20000000-0000-4000-8000-000000000002');
insert into public.point_rules(id,challenge_group_id,version,action_type,points)
values('20000000-0000-4000-8000-000000000011','20000000-0000-4000-8000-000000000010',1,'action_completed',2);
insert into public.action_events(id,user_id,challenge_group_id,source_app,action_type,title,occurred_at,visibility) values
 ('20000000-0000-4000-8000-000000000012','20000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000010','sibling_showdown','action_completed','Winner one','2026-07-01 12:00:00+00','challenge_group'),
 ('20000000-0000-4000-8000-000000000013','20000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000010','sibling_showdown','action_completed','Winner two','2026-07-01 13:00:00+00','challenge_group'),
 ('20000000-0000-4000-8000-000000000014','20000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000010','sibling_showdown','action_completed','Sibling one','2026-07-01 12:00:00+00','challenge_group');
insert into public.rooms(id,owner_id,challenge_group_id,name,theme)
values('20000000-0000-4000-8000-000000000020','20000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000010','Target room','sky_room');
insert into public.room_items(id,name,item_type,rarity)
values('20000000-0000-4000-8000-000000000030','Tiny flag','sticker','common');
insert into public.room_slots(id,room_id,slot_key,slot_type)
values('20000000-0000-4000-8000-000000000040','20000000-0000-4000-8000-000000000020','shelf','decor');
insert into public.room_action_entitlements(id,challenge_group_id,user_id,target_user_id,entitlement_type,source_date)
values('20000000-0000-4000-8000-000000000050','20000000-0000-4000-8000-000000000010','20000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','mischief','2026-06-30');
