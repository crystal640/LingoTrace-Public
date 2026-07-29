create or replace function public.record_lightweight_review(review_item_id uuid, review_rating text)
returns timestamptz
language plpgsql security invoker set search_path = public
as $$
declare
  owner_id uuid := auth.uid();
  state_id uuid;
  previous_due timestamptz;
  next_due timestamptz;
  next_state text;
begin
  if owner_id is null then raise exception 'Authentication required'; end if;
  if review_rating not in ('forgot', 'vague', 'remembered', 'mastered') then raise exception 'Invalid rating'; end if;
  if not exists (select 1 from public.vocabulary_entries where id = review_item_id and user_id = owner_id and deleted_at is null) then
    raise exception 'Vocabulary item not found';
  end if;

  next_due := now() + case review_rating
    when 'forgot' then interval '10 minutes'
    when 'vague' then interval '1 day'
    when 'remembered' then interval '3 days'
    else interval '7 days' end;
  next_state := case review_rating when 'forgot' then 'relearning' when 'vague' then 'learning' when 'mastered' then 'mastered' else 'review' end;

  select id, due_at into state_id, previous_due from public.review_states
    where user_id = owner_id and item_type = 'vocabulary' and item_id = review_item_id for update;
  if state_id is null then
    insert into public.review_states (user_id, item_type, item_id, state, due_at, last_reviewed_at, review_count, lapse_count)
    values (owner_id, 'vocabulary', review_item_id, next_state, next_due, now(), 1, case when review_rating = 'forgot' then 1 else 0 end)
    returning id into state_id;
  else
    update public.review_states set state = next_state, due_at = next_due, last_reviewed_at = now(),
      review_count = review_count + 1, lapse_count = lapse_count + case when review_rating = 'forgot' then 1 else 0 end
    where id = state_id;
  end if;
  insert into public.review_logs (user_id, review_state_id, rating, previous_due_at, next_due_at)
  values (owner_id, state_id, review_rating, previous_due, next_due);
  return next_due;
end;
$$;

revoke all on function public.record_lightweight_review(uuid, text) from public;
grant execute on function public.record_lightweight_review(uuid, text) to authenticated;
