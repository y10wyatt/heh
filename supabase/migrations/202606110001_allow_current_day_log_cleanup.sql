create policy "daily_logs_delete_self_current_day"
on public.daily_logs for delete
to authenticated
using (user_id = auth.uid() and log_date = current_date and public.is_competition_member(competition_id));

create policy "weight_entries_delete_self_current_day"
on public.weight_entries for delete
to authenticated
using (user_id = auth.uid() and entry_date = current_date and public.is_competition_member(competition_id));

create policy "workout_logs_delete_self_current_day"
on public.workout_logs for delete
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.daily_logs
    where daily_logs.id = workout_logs.daily_log_id
      and daily_logs.user_id = auth.uid()
      and daily_logs.log_date = current_date
      and public.is_competition_member(daily_logs.competition_id)
  )
);

create policy "meal_logs_delete_self_current_day"
on public.meal_logs for delete
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.daily_logs
    where daily_logs.id = meal_logs.daily_log_id
      and daily_logs.user_id = auth.uid()
      and daily_logs.log_date = current_date
      and public.is_competition_member(daily_logs.competition_id)
  )
);
