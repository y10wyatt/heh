begin;
select plan(8);

select has_schema('sibling_private','private implementation schema exists');
select has_table('public','action_events','ActionEvent evidence table exists');
select has_table('public','room_actions','RoomAction mutation table exists');
select has_table('public','room_action_entitlements','entitlement table exists');
select has_table('public','daily_results','daily result table exists');
select has_function('public','finalize_day',array['uuid','timestamp with time zone'],'public finalize gateway exists');
select has_function('public','apply_room_action',array['uuid','uuid','uuid','uuid','text'],'public room action gateway exists');
select row_eq(
  $$select count(*)::bigint from pg_policies where schemaname='public' and tablename='action_events'$$,
  row(2::bigint),
  'action_events has read and insert policies'
);

select * from finish();
rollback;
