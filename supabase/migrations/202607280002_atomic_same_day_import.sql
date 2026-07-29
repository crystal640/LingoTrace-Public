create unique index if not exists learning_reports_user_learning_date_key
  on public.learning_reports (user_id, learning_date);

create or replace function public.import_lingotrace_report(report_payload jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  owner_id uuid := auth.uid();
  database_report_id uuid;
  existing_report public.learning_reports%rowtype;
  incoming_hash text := encode(digest(report_payload::text, 'sha256'), 'hex');
  incoming_date date := (report_payload ->> 'learning_date')::date;
  incoming_total integer := (report_payload ->> 'total_minutes')::integer;
  incoming_speaking integer := (report_payload ->> 'speaking_minutes')::integer;
  was_created boolean := false;
  topic_count integer := 0;
  vocabulary_count integer := 0;
  sentence_count integer := 0;
  correction_count integer := 0;
begin
  if owner_id is null then
    raise exception 'Authentication required';
  end if;
  if report_payload ->> 'schema_version' <> 'LINGOTRACE_REPORT_V1' then
    raise exception 'Unsupported schema_version';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(owner_id::text, 0));

  if exists (
    select 1 from public.learning_reports
    where user_id = owner_id
      and (report_id = report_payload ->> 'report_id'
        or source_message_id = report_payload ->> 'source_message_id'
        or content_hash = incoming_hash)
  ) or exists (
    select 1 from public.sync_events
    where user_id = owner_id
      and status in ('created', 'duplicate')
      and (report_id = report_payload ->> 'report_id'
        or source_message_id = report_payload ->> 'source_message_id'
        or details ->> 'content_hash' = incoming_hash)
  ) then
    insert into public.sync_events (user_id, report_id, source_message_id, status, details)
    values (owner_id, report_payload ->> 'report_id', report_payload ->> 'source_message_id', 'duplicate',
      jsonb_build_object('reason', 'report_id_source_message_id_or_content_hash_exists', 'content_hash', incoming_hash));
    return jsonb_build_object('result', 'duplicate');
  end if;

  select * into existing_report
  from public.learning_reports
  where user_id = owner_id and learning_date = incoming_date
  for update;

  if not found then
    insert into public.learning_reports (
      user_id, report_id, schema_version, source_conversation_id, source_message_id,
      content_hash, learning_date, timezone, total_minutes, speaking_minutes,
      overall_score, fluency_score, grammar_score, vocabulary_score,
      naturalness_score, communication_score, qualitative_review, raw_payload
    ) values (
      owner_id, report_payload ->> 'report_id', report_payload ->> 'schema_version',
      report_payload ->> 'source_conversation_id', report_payload ->> 'source_message_id',
      incoming_hash, incoming_date, coalesce(report_payload ->> 'timezone', 'Asia/Shanghai'),
      incoming_total, incoming_speaking,
      (report_payload #>> '{scores,overall}')::numeric,
      (report_payload #>> '{scores,fluency}')::numeric,
      (report_payload #>> '{scores,grammar}')::numeric,
      (report_payload #>> '{scores,vocabulary}')::numeric,
      (report_payload #>> '{scores,naturalness}')::numeric,
      (report_payload #>> '{scores,communication}')::numeric,
      report_payload ->> 'qualitative_review', report_payload
    ) returning id into database_report_id;
    was_created := true;
  else
    database_report_id := existing_report.id;
  end if;

  with incoming as (
    select value #>> '{}' as label, ordinality::integer - 1 as position
    from jsonb_array_elements(coalesce(report_payload -> 'topics', '[]')) with ordinality
  ), inserted as (
    insert into public.learning_topics (user_id, report_id, label, position)
    select owner_id, database_report_id, incoming.label,
      coalesce((select max(position) + 1 from public.learning_topics where report_id = database_report_id), 0) + incoming.position
    from incoming
    where not exists (
      select 1 from public.learning_topics current
      where current.report_id = database_report_id
        and lower(regexp_replace(trim(current.label), '\s+', ' ', 'g')) = lower(regexp_replace(trim(incoming.label), '\s+', ' ', 'g'))
    ) returning 1
  ) select count(*) into topic_count from inserted;

  if report_payload ? 'thought' and not exists (
    select 1 from public.daily_thoughts where report_id = database_report_id
  ) then
    insert into public.daily_thoughts (user_id, report_id, zh, en)
    values (owner_id, database_report_id, report_payload #>> '{thought,zh}', report_payload #>> '{thought,en}');
  end if;

  insert into public.feedback_items (user_id, report_id, kind, content, position)
  select owner_id, database_report_id, 'strength', value #>> '{}', ordinality::integer - 1
  from jsonb_array_elements(coalesce(report_payload -> 'strengths', '[]')) with ordinality
  where not exists (
    select 1 from public.feedback_items f where f.report_id = database_report_id and f.kind = 'strength'
      and lower(regexp_replace(trim(f.content), '\s+', ' ', 'g')) = lower(regexp_replace(trim(value #>> '{}'), '\s+', ' ', 'g'))
  );

  insert into public.feedback_items (user_id, report_id, kind, category, content, action_label, target_tab, position)
  select owner_id, database_report_id, 'improvement', value ->> 'category', value ->> 'content',
    value ->> 'action_label', value ->> 'target_tab', ordinality::integer - 1
  from jsonb_array_elements(coalesce(report_payload -> 'improvements', '[]')) with ordinality
  where not exists (
    select 1 from public.feedback_items f where f.report_id = database_report_id and f.kind = 'improvement'
      and lower(regexp_replace(trim(f.content), '\s+', ' ', 'g')) = lower(regexp_replace(trim(value ->> 'content'), '\s+', ' ', 'g'))
  );

  insert into public.feedback_items (user_id, report_id, kind, content, position)
  select owner_id, database_report_id, 'next_goal', value #>> '{}', ordinality::integer - 1
  from jsonb_array_elements(coalesce(report_payload -> 'next_goals', '[]')) with ordinality
  where not exists (
    select 1 from public.feedback_items f where f.report_id = database_report_id and f.kind = 'next_goal'
      and lower(regexp_replace(trim(f.content), '\s+', ' ', 'g')) = lower(regexp_replace(trim(value #>> '{}'), '\s+', ' ', 'g'))
  );

  with inserted as (
    insert into public.vocabulary_entries (
      user_id, source_report_id, normalized_term, term, ipa, part_of_speech, meaning_zh,
      example_en, example_zh, collocation, source_context, tags
    ) select owner_id, database_report_id, lower(regexp_replace(trim(value ->> 'term'), '\s+', ' ', 'g')),
      value ->> 'term', value ->> 'ipa', value ->> 'part_of_speech', value ->> 'meaning_zh',
      value ->> 'example_en', value ->> 'example_zh', value ->> 'collocation', value ->> 'source_context',
      array(select jsonb_array_elements_text(coalesce(value -> 'tags', '[]')))
    from jsonb_array_elements(coalesce(report_payload -> 'vocabulary', '[]'))
    on conflict (user_id, normalized_term) do nothing returning 1
  ) select count(*) into vocabulary_count from inserted;

  with inserted as (
    insert into public.sentence_entries (
      user_id, source_report_id, normalized_pattern, pattern, meaning_zh, example_en, example_zh, category, source_tag
    ) select owner_id, database_report_id, lower(regexp_replace(trim(value ->> 'pattern'), '\s+', ' ', 'g')),
      value ->> 'pattern', value ->> 'meaning_zh', value ->> 'example_en', value ->> 'example_zh',
      coalesce(value ->> 'category', 'daily'), value ->> 'source_tag'
    from jsonb_array_elements(coalesce(report_payload -> 'sentences', '[]'))
    on conflict (user_id, normalized_pattern) do nothing returning 1
  ) select count(*) into sentence_count from inserted;

  with incoming as (
    select value from jsonb_array_elements(coalesce(report_payload -> 'corrections', '[]'))
  ), inserted as (
    insert into public.correction_entries (
      user_id, source_report_id, category, original_sentence, corrected_sentence, explanation,
      memory_tip, error_highlight, corrected_highlight
    ) select owner_id, database_report_id, value ->> 'category', value ->> 'original_sentence',
      value ->> 'corrected_sentence', value ->> 'explanation', value ->> 'memory_tip',
      value ->> 'error_highlight', value ->> 'corrected_highlight'
    from incoming
    where not exists (
      select 1 from public.correction_entries c where c.user_id = owner_id
        and c.category = incoming.value ->> 'category'
        and lower(regexp_replace(trim(c.original_sentence), '\s+', ' ', 'g')) = lower(regexp_replace(trim(incoming.value ->> 'original_sentence'), '\s+', ' ', 'g'))
        and lower(regexp_replace(trim(c.corrected_sentence), '\s+', ' ', 'g')) = lower(regexp_replace(trim(incoming.value ->> 'corrected_sentence'), '\s+', ' ', 'g'))
    ) returning 1
  ) select count(*) into correction_count from inserted;

  if not was_created then
    update public.learning_reports set
      total_minutes = existing_report.total_minutes + incoming_total,
      speaking_minutes = existing_report.speaking_minutes + incoming_speaking,
      overall_score = case when incoming_speaking = 0 then existing_report.overall_score when existing_report.speaking_minutes = 0 or existing_report.overall_score is null then (report_payload #>> '{scores,overall}')::numeric else round((existing_report.overall_score * existing_report.speaking_minutes + (report_payload #>> '{scores,overall}')::numeric * incoming_speaking) / (existing_report.speaking_minutes + incoming_speaking), 2) end,
      fluency_score = case when incoming_speaking = 0 then existing_report.fluency_score when existing_report.speaking_minutes = 0 or existing_report.fluency_score is null then (report_payload #>> '{scores,fluency}')::numeric else round((existing_report.fluency_score * existing_report.speaking_minutes + (report_payload #>> '{scores,fluency}')::numeric * incoming_speaking) / (existing_report.speaking_minutes + incoming_speaking), 2) end,
      grammar_score = case when incoming_speaking = 0 then existing_report.grammar_score when existing_report.speaking_minutes = 0 or existing_report.grammar_score is null then (report_payload #>> '{scores,grammar}')::numeric else round((existing_report.grammar_score * existing_report.speaking_minutes + (report_payload #>> '{scores,grammar}')::numeric * incoming_speaking) / (existing_report.speaking_minutes + incoming_speaking), 2) end,
      vocabulary_score = case when incoming_speaking = 0 then existing_report.vocabulary_score when existing_report.speaking_minutes = 0 or existing_report.vocabulary_score is null then (report_payload #>> '{scores,vocabulary}')::numeric else round((existing_report.vocabulary_score * existing_report.speaking_minutes + (report_payload #>> '{scores,vocabulary}')::numeric * incoming_speaking) / (existing_report.speaking_minutes + incoming_speaking), 2) end,
      naturalness_score = case when incoming_speaking = 0 then existing_report.naturalness_score when existing_report.speaking_minutes = 0 or existing_report.naturalness_score is null then (report_payload #>> '{scores,naturalness}')::numeric else round((existing_report.naturalness_score * existing_report.speaking_minutes + (report_payload #>> '{scores,naturalness}')::numeric * incoming_speaking) / (existing_report.speaking_minutes + incoming_speaking), 2) end,
      communication_score = case when incoming_speaking = 0 then existing_report.communication_score when existing_report.speaking_minutes = 0 or existing_report.communication_score is null then (report_payload #>> '{scores,communication}')::numeric else round((existing_report.communication_score * existing_report.speaking_minutes + (report_payload #>> '{scores,communication}')::numeric * incoming_speaking) / (existing_report.speaking_minutes + incoming_speaking), 2) end,
      qualitative_review = case when existing_report.qualitative_review = report_payload ->> 'qualitative_review' then existing_report.qualitative_review else concat_ws(E'\n\n', nullif(existing_report.qualitative_review, ''), nullif(report_payload ->> 'qualitative_review', '')) end,
      raw_payload = case when jsonb_typeof(existing_report.raw_payload -> 'imports') = 'array' then jsonb_set(existing_report.raw_payload, '{imports}', (existing_report.raw_payload -> 'imports') || jsonb_build_array(report_payload)) else jsonb_build_object('imports', jsonb_build_array(existing_report.raw_payload, report_payload)) end,
      imported_at = now()
    where id = database_report_id;
  end if;

  insert into public.sync_events (user_id, report_id, source_message_id, status, details)
  values (owner_id, report_payload ->> 'report_id', report_payload ->> 'source_message_id', 'created',
    jsonb_build_object('action', case when was_created then 'created' else 'merged' end, 'content_hash', incoming_hash,
      'counts', jsonb_build_object('topics', topic_count, 'vocabulary', vocabulary_count, 'sentences', sentence_count, 'corrections', correction_count)));

  return jsonb_build_object('result', case when was_created then 'created' else 'merged' end);
exception when others then
  insert into public.sync_events (user_id, report_id, source_message_id, status, details)
  values (owner_id, report_payload ->> 'report_id', report_payload ->> 'source_message_id', 'rejected', jsonb_build_object('error', sqlerrm));
  raise;
end;
$$;

revoke all on function public.import_lingotrace_report(jsonb) from public;
grant execute on function public.import_lingotrace_report(jsonb) to authenticated;
