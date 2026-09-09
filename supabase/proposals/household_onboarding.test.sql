begin;
create extension if not exists pgtap with schema extensions;
select plan(20);

select extensions.ok(
  not has_function_privilege(
    'anon',
    'public.our_place_create_household(text,text,text,text)',
    'EXECUTE'
  ),
  'signed-out users cannot create households'
);
select extensions.ok(
  not has_table_privilege('authenticated', 'public.groups', 'INSERT'),
  'signed-in users cannot bypass household creation'
);
select extensions.ok(
  not has_table_privilege('authenticated', 'public.group_members', 'INSERT'),
  'signed-in users cannot bypass an invitation'
);
select extensions.ok(
  not has_table_privilege('authenticated', 'public.group_members', 'UPDATE'),
  'members cannot promote their own role'
);

insert into auth.users(id, email) values
  ('30000000-0000-4000-8000-000000000001', 'owner@example.test'),
  ('30000000-0000-4000-8000-000000000002', 'sibling@example.test'),
  ('30000000-0000-4000-8000-000000000003', 'outsider@example.test');

set local role authenticated;
select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000001', true);

select extensions.lives_ok(
  $$select public.our_place_create_household('Our test home', 'Owner')$$,
  'owner can create a household'
);
select extensions.is(
  (select count(*)::int from public.group_members where user_id = (select auth.uid())),
  1,
  'create is idempotent per account'
);
select public.our_place_create_household('Ignored duplicate', 'Owner');
select extensions.is(
  (select count(*)::int from public.group_members where user_id = (select auth.uid())),
  1,
  'retry does not create another membership'
);
select extensions.ok(
  (select onboarding_completed from public.our_place_account_state()),
  'creator finishes onboarding'
);
select extensions.is(
  (select count(*)::int from public.household_rooms where owner_id = (select auth.uid())),
  1,
  'creator receives one room'
);

select * from public.our_place_create_invite(
  (select group_id from public.group_members where user_id = (select auth.uid()))
) \gset invite_

select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000003', true);
select extensions.is_empty(
  $$select code from public.group_invites$$,
  'outsider cannot enumerate unused invite codes'
);

select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000002', true);
select extensions.lives_ok(
  format(
    'select public.our_place_join_household(%L, %L)',
    :'invite_code',
    'Sibling'
  ),
  'sibling can atomically claim a valid invite'
);
select extensions.is(
  (select count(*)::int from public.group_members where user_id = (select auth.uid())),
  1,
  'join creates one membership'
);
select extensions.is(
  (select count(*)::int from public.household_rooms where owner_id = (select auth.uid())),
  1,
  'joining sibling receives one room'
);
select extensions.is(
  (select count(*)::int from public.group_invites where used_by = (select auth.uid())),
  1,
  'invite is marked consumed'
);
select extensions.is(
  public.our_place_join_household(:'invite_code', 'Sibling'),
  (select group_id from public.group_members where user_id = (select auth.uid())),
  'join retry returns the existing household'
);

select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000001', true);
select extensions.lives_ok(
  $$select public.our_place_leave_action(
    '30000000-0000-4000-8000-000000000101',
    (select group_id from public.group_members where user_id = (select auth.uid())),
    '30000000-0000-4000-8000-000000000002',
    'note', 'Welcome home'
  )$$,
  'owner can leave the first persistent note'
);
select extensions.is(
  (select count(*)::int from public.household_actions where target_user_id = '30000000-0000-4000-8000-000000000002'),
  1,
  'the first action persists once'
);
select extensions.throws_ok(
  $$select public.our_place_leave_action(
    '30000000-0000-4000-8000-000000000101',
    (select group_id from public.group_members where user_id = (select auth.uid())),
    '30000000-0000-4000-8000-000000000002',
    'note', 'Duplicate retry'
  )$$,
  '23505',
  null,
  'client action ID prevents duplicate writes'
);

select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000002', true);
select public.our_place_complete_onboarding(
  (select group_id from public.group_members where user_id = (select auth.uid())),
  'Sibling', 'hamster-orange', 'gentle'
);
select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000001', true);
select extensions.throws_ok(
  $$select public.our_place_leave_action(
    '30000000-0000-4000-8000-000000000102',
    (select group_id from public.group_members where user_id = (select auth.uid())),
    '30000000-0000-4000-8000-000000000002',
    'pillow'
  )$$,
  'P0001',
  'recipient preferences do not allow this action',
  'gentle preference blocks visual pranks'
);
select extensions.is(
  (select count(*)::int from public.group_members where group_id = (
    select group_id from public.group_members where user_id = (select auth.uid())
  )),
  2,
  'household contains both accounts'
);

select * from extensions.finish();
rollback;
