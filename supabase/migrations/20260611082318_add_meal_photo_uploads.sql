insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'meal-photos',
  'meal-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "meal_photos_select_own_folder" on storage.objects;
create policy "meal_photos_select_own_folder"
on storage.objects for select
to authenticated
using (
  bucket_id = 'meal-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "meal_photos_insert_own_folder" on storage.objects;
create policy "meal_photos_insert_own_folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'meal-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "meal_photos_update_own_folder" on storage.objects;
create policy "meal_photos_update_own_folder"
on storage.objects for update
to authenticated
using (
  bucket_id = 'meal-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'meal-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "meal_photos_delete_own_folder" on storage.objects;
create policy "meal_photos_delete_own_folder"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'meal-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "meal_logs_delete_self_current_day" on public.meal_logs;
create policy "meal_logs_delete_self_current_day"
on public.meal_logs for delete
to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.daily_logs
    where daily_logs.id = meal_logs.daily_log_id
      and daily_logs.user_id = (select auth.uid())
      and daily_logs.log_date = current_date
      and public.is_competition_member(daily_logs.competition_id)
  )
);
