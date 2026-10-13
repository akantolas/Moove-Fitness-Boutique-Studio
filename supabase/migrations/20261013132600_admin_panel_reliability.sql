-- Server-only operations. Every mutation below runs in one Postgres transaction.
-- Version matches the migration journal created by Supabase apply_migration.
alter table public.user_packages
  add column if not exists payment_method text,
  add column if not exists confirmed_by uuid references public.profiles(id),
  add column if not exists paid_at timestamptz,
  add column if not exists paid_at_source text,
  add column if not exists base_sessions integer,
  add column if not exists bonus_sessions integer not null default 0,
  add column if not exists session_adjustment integer not null default 0;
alter table public.availability_slots add column if not exists archived_at timestamptz;
alter table public.posing_bookings add column if not exists duration_minutes integer;

-- The previous deployment can still insert packages while the rollout completes.
create function public.posing_package_components() returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if new.base_sessions is null then
    select sessions_total into new.base_sessions from public.package_plans where key=new.plan_key;
    new.bonus_sessions:=greatest(0,new.sessions_total-new.base_sessions);
    new.session_adjustment:=least(0,new.sessions_total-new.base_sessions);
  end if;
  return new;
end; $$;
create trigger posing_package_components before insert on public.user_packages
  for each row execute function public.posing_package_components();

-- Preserve existing totals. Infer legacy payment times only from available records.
update public.user_packages up set
  base_sessions = pp.sessions_total,
  bonus_sessions = greatest(0, up.sessions_total - pp.sessions_total),
  session_adjustment = least(0, up.sessions_total - pp.sessions_total)
from public.package_plans pp where pp.key = up.plan_key and up.base_sessions is null;
update public.user_packages up set
  paid_at = case
    when up.stripe_payment_id ~ '^manual:[0-9a-f-]+:[0-9]{13}$'
      then to_timestamp(split_part(up.stripe_payment_id, ':', 3)::numeric / 1000)
    else coalesce((select b.updated_at from public.posing_bookings b
      where b.user_package_id=up.id and b.status in ('confirmed','completed')
      order by b.created_at limit 1), up.created_at) end,
  paid_at_source = case
    when up.stripe_payment_id ~ '^manual:[0-9a-f-]+:[0-9]{13}$' then 'manual_reference'
    when exists(select 1 from public.posing_bookings b where b.user_package_id=up.id
      and b.status in ('confirmed','completed')) then 'booking_confirmation'
    else 'legacy_created_at' end,
  payment_method = case when up.stripe_payment_id like 'manual:%' then 'manual' else 'stripe' end
where up.stripe_payment_id is not null and up.paid_at is null;
update public.posing_bookings b set duration_minutes=pp.duration_minutes
from public.package_plans pp where pp.key=b.plan_key and b.duration_minutes is null;
alter table public.user_packages alter column base_sessions set not null;
alter table public.user_packages add constraint user_packages_session_balance
  check (sessions_used >= 0 and sessions_total >= sessions_used and
    sessions_total=base_sessions+bonus_sessions+session_adjustment);
alter table public.user_packages add constraint user_packages_payment_method
  check (payment_method is null or payment_method in ('stripe','manual'));
alter table public.posing_bookings add constraint posing_booking_duration
  check (duration_minutes is null or duration_minutes between 15 and 120);

create table public.posing_session_adjustments (
  id uuid primary key default gen_random_uuid(),
  user_package_id uuid not null references public.user_packages(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  delta integer not null check (delta <> 0),
  reason text not null check (length(trim(reason)) between 3 and 500),
  total_before integer not null,
  total_after integer not null,
  request_id uuid not null unique,
  created_at timestamptz not null default now()
);
create index posing_adjustments_package_idx on public.posing_session_adjustments(user_package_id,created_at desc);
alter table public.posing_session_adjustments enable row level security;
revoke all on public.posing_session_adjustments from anon,authenticated;
grant all on public.posing_session_adjustments to service_role;
create index user_packages_paid_offer_idx on public.user_packages(user_id,paid_at) where paid_at is not null;

alter table public.moove_program_purchases
  add column if not exists delivery_status text not null default 'unknown',
  add column if not exists delivery_error text,
  add column if not exists delivery_attempted_at timestamptz;
alter table public.nutrition_plan_orders
  add column if not exists delivery_status text not null default 'unknown',
  add column if not exists delivery_error text,
  add column if not exists delivery_attempted_at timestamptz;
update public.moove_program_purchases set delivery_status='sent' where access_email_sent_at is not null;
update public.nutrition_plan_orders set delivery_status='sent' where plan_email_sent_at is not null;
alter table public.moove_program_purchases add constraint program_delivery_status
  check(delivery_status in ('unknown','pending','sent','failed'));
alter table public.nutrition_plan_orders add constraint nutrition_delivery_status
  check(delivery_status in ('unknown','pending','sent','failed'));

create function public.posing_bonus_sessions(p_user_id uuid,p_plan_key text,p_at timestamptz,p_exclude_package uuid default null)
returns integer language sql stable security invoker set search_path='' as $$
  select case
    when p_plan_key not in ('sapphire','ruby','diamond') then 0
    when p_at >= timestamptz '2026-09-01 00:00+03' and p_at < timestamptz '2026-10-01 00:00+03' then 1
    when p_at >= timestamptz '2026-10-01 00:00+03' and p_at < timestamptz '2026-11-01 00:00+02'
      and not exists(select 1 from public.user_packages up where up.user_id=p_user_id
        and up.paid_at is not null
        and (p_exclude_package is null or up.id<>p_exclude_package)) then 2
    when p_at >= timestamptz '2026-10-01 00:00+03' and p_at < timestamptz '2027-04-01 00:00+03'
      and exists(select 1 from public.user_packages up where up.user_id=p_user_id
        and up.plan_key in ('sapphire','ruby','diamond') and up.status in ('active','expired')
        and up.paid_at >= timestamptz '2026-09-01 00:00+03' and up.paid_at < timestamptz '2026-10-01 00:00+03'
        and (p_exclude_package is null or up.id<>p_exclude_package)) then 1
    else 0 end;
$$;

create function public.posing_reserve_booking(p_user_id uuid,p_slot_id uuid,p_plan_key text,p_locale text,p_amount_eur integer)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_slot public.availability_slots; v_plan public.package_plans; v_pkg public.user_packages;
  v_booking public.posing_bookings; v_end timestamptz; v_bonus integer; v_existing boolean:=false;
begin
  perform pg_advisory_xact_lock(hashtext('posing:calendar'));
  select * into v_slot from public.availability_slots where id=p_slot_id for update;
  if not found or v_slot.is_blocked or v_slot.archived_at is not null then raise exception 'slot_not_found'; end if;
  if v_slot.start_at <= now() then raise exception 'slot_in_past'; end if;
  select * into v_plan from public.package_plans where key=p_plan_key;
  if not found then raise exception 'invalid_plan'; end if;
  v_end:=v_slot.start_at+make_interval(mins=>v_plan.duration_minutes);
  if exists(select 1 from public.availability_slots s where s.is_blocked and s.archived_at is null
    and s.start_at<v_end and s.end_at>v_slot.start_at) then raise exception 'slot_not_available'; end if;
  if exists(select 1 from public.posing_bookings b join public.availability_slots s on s.id=b.slot_id
    join public.package_plans pp on pp.key=b.plan_key
    where b.status<>'cancelled' and s.start_at<v_end
      and s.start_at+make_interval(mins=>coalesce(b.duration_minutes,pp.duration_minutes))>v_slot.start_at)
    then raise exception 'slot_taken'; end if;
  if exists(select 1 from public.user_packages up where up.user_id=p_user_id and up.plan_key=p_plan_key
    and up.status='pending_payment' and up.period_end>now()) then raise exception 'payment_required_first'; end if;
  select * into v_pkg from public.user_packages where user_id=p_user_id and plan_key=p_plan_key
    and status='active' and period_end>now() and sessions_used<sessions_total order by created_at desc limit 1 for update;
  v_existing:=found;
  if v_existing then
    if v_end>v_pkg.period_end then raise exception 'outside_package_period'; end if;
    update public.user_packages set sessions_used=sessions_used+1,updated_at=now() where id=v_pkg.id returning * into v_pkg;
  else
    if v_end>now()+make_interval(days=>v_plan.period_days) then raise exception 'outside_package_period'; end if;
    v_bonus:=public.posing_bonus_sessions(p_user_id,p_plan_key,now());
    insert into public.user_packages(user_id,plan_key,base_sessions,bonus_sessions,sessions_total,sessions_used,
      status,period_start,period_end,amount_eur)
      values(p_user_id,p_plan_key,v_plan.sessions_total,v_bonus,v_plan.sessions_total+v_bonus,0,
        'pending_payment',now(),now()+make_interval(days=>v_plan.period_days),p_amount_eur) returning * into v_pkg;
  end if;
  insert into public.posing_bookings(user_id,slot_id,plan_key,user_package_id,status,locale,amount_eur,duration_minutes)
    values(p_user_id,p_slot_id,p_plan_key,v_pkg.id,case when v_existing then 'confirmed' else 'pending_payment' end,
      case when p_locale='en' then 'en' else 'el' end,p_amount_eur,v_plan.duration_minutes) returning * into v_booking;
  return jsonb_build_object('ok',true,'booking',to_jsonb(v_booking),'userPackage',to_jsonb(v_pkg),
    'booking_type',case when v_existing then 'included_session' else 'new_package' end,
    'sessions_remaining',greatest(0,v_pkg.sessions_total-v_pkg.sessions_used));
end; $$;

create function public.posing_activate_payment(p_booking_id uuid,p_package_id uuid,p_payment_ref text,
  p_method text,p_actor_id uuid default null,p_paid_at timestamptz default now())
returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_b public.posing_bookings; v_p public.user_packages; v_days integer; v_bonus integer;
begin
  perform pg_advisory_xact_lock(hashtext('posing:calendar'));
  select * into v_b from public.posing_bookings where id=p_booking_id for update;
  if not found then raise exception 'booking_not_found'; end if;
  if p_package_id is not null and p_package_id is distinct from v_b.user_package_id then raise exception 'invalid_package'; end if;
  select * into v_p from public.user_packages where id=v_b.user_package_id for update;
  if not found then raise exception 'package_not_found'; end if;
  if v_b.status in ('confirmed','completed') and v_p.paid_at is not null then return jsonb_build_object('ok',true,'already',true); end if;
  if v_b.status<>'pending_payment' then raise exception 'invalid_booking_status'; end if;
  if v_p.status not in ('pending_payment','active') then raise exception 'invalid_package_status'; end if;
  select period_days into v_days from public.package_plans where key=v_p.plan_key;
  v_bonus:=public.posing_bonus_sessions(v_p.user_id,v_p.plan_key,p_paid_at,v_p.id);
  update public.user_packages set status='active',stripe_payment_id=p_payment_ref,payment_method=p_method,
    confirmed_by=p_actor_id,paid_at=p_paid_at,paid_at_source='recorded',bonus_sessions=v_bonus,
    sessions_total=base_sessions+v_bonus+session_adjustment,
    sessions_used=(select count(*) from public.posing_bookings where user_package_id=v_p.id and status in ('confirmed','completed'))+1,
    period_start=p_paid_at,period_end=p_paid_at+make_interval(days=>v_days),updated_at=now() where id=v_p.id;
  update public.posing_bookings set status='confirmed',stripe_session_id=p_payment_ref,updated_at=now() where id=v_b.id;
  return jsonb_build_object('ok',true,'already',false);
end; $$;

create function public.posing_cancel_booking(p_booking_id uuid,p_user_id uuid,p_allow_admin boolean default false)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_b public.posing_bookings; v_start timestamptz;
begin
  perform pg_advisory_xact_lock(hashtext('posing:calendar'));
  select * into v_b from public.posing_bookings where id=p_booking_id for update;
  if not found then raise exception 'booking_not_found'; end if;
  if p_allow_admin then
    if not exists(select 1 from public.profiles where id=p_user_id and role='admin') then raise exception 'forbidden'; end if;
  elsif v_b.user_id<>p_user_id then raise exception 'forbidden'; end if;
  if v_b.status='cancelled' then return jsonb_build_object('ok',true,'already',true); end if;
  select start_at into v_start from public.availability_slots where id=v_b.slot_id;
  if v_b.status='completed' or (v_b.status='confirmed' and v_start<=now()) then raise exception 'cannot_cancel'; end if;
  if v_b.status='confirmed' then
    update public.user_packages set sessions_used=sessions_used-1,updated_at=now() where id=v_b.user_package_id;
  elsif v_b.status='pending_payment' then
    update public.user_packages set status='cancelled',updated_at=now() where id=v_b.user_package_id and status='pending_payment';
  end if;
  update public.posing_bookings set status='cancelled',updated_at=now() where id=v_b.id;
  return jsonb_build_object('ok',true,'already',false);
end; $$;

create function public.posing_cancel_package(p_package_id uuid,p_actor_id uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_p public.user_packages; v_ids jsonb;
begin
  perform pg_advisory_xact_lock(hashtext('posing:calendar'));
  if not exists(select 1 from public.profiles where id=p_actor_id and role='admin') then raise exception 'forbidden'; end if;
  select * into v_p from public.user_packages where id=p_package_id for update;
  if not found then raise exception 'package_not_found'; end if;
  if v_p.status='cancelled' then return jsonb_build_object('ok',true,'already',true,'cancelledBookingIds','[]'::jsonb); end if;
  with cancelled as (update public.posing_bookings b set status='cancelled',updated_at=now()
    from public.availability_slots s where b.slot_id=s.id and b.user_package_id=p_package_id
      and (b.status='pending_payment' or (b.status='confirmed' and s.start_at>now())) returning b.id)
    select coalesce(jsonb_agg(id),'[]'::jsonb) into v_ids from cancelled;
  update public.user_packages set status='cancelled',updated_at=now(),sessions_used=(select count(*)
    from public.posing_bookings where user_package_id=p_package_id and status in ('confirmed','completed')) where id=p_package_id;
  return jsonb_build_object('ok',true,'already',false,'cancelledBookingIds',v_ids);
end; $$;

create function public.posing_adjust_sessions(p_package_id uuid,p_actor_id uuid,p_delta integer,p_reason text,p_request_id uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_p public.user_packages; v_old public.posing_session_adjustments;
begin
  perform pg_advisory_xact_lock(hashtext('posing:calendar'));
  if not exists(select 1 from public.profiles where id=p_actor_id and role='admin') then raise exception 'forbidden'; end if;
  if p_delta is null or p_delta not in (-1,1) or p_reason is null or length(trim(p_reason)) not between 3 and 500 or p_request_id is null then raise exception 'invalid_adjustment'; end if;
  select * into v_old from public.posing_session_adjustments where request_id=p_request_id;
  if found then
    if v_old.user_package_id<>p_package_id or v_old.actor_id<>p_actor_id or v_old.delta<>p_delta or v_old.reason<>trim(p_reason)
      then raise exception 'adjustment_conflict'; end if;
    return jsonb_build_object('ok',true,'already',true);
  end if;
  select * into v_p from public.user_packages where id=p_package_id for update;
  if not found then raise exception 'package_not_found'; end if;
  if v_p.status<>'active' or v_p.period_end<=now() then raise exception 'package_not_active'; end if;
  if v_p.sessions_total+p_delta<v_p.sessions_used then raise exception 'no_available_sessions'; end if;
  update public.user_packages set sessions_total=sessions_total+p_delta,session_adjustment=session_adjustment+p_delta,updated_at=now() where id=v_p.id;
  insert into public.posing_session_adjustments(user_package_id,actor_id,delta,reason,total_before,total_after,request_id)
    values(v_p.id,p_actor_id,p_delta,trim(p_reason),v_p.sessions_total,v_p.sessions_total+p_delta,p_request_id);
  return jsonb_build_object('ok',true,'already',false);
end; $$;

create function public.posing_complete_booking(p_booking_id uuid,p_actor_id uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_b public.posing_bookings; v_end timestamptz;
begin
  perform pg_advisory_xact_lock(hashtext('posing:calendar'));
  if not exists(select 1 from public.profiles where id=p_actor_id and role='admin') then raise exception 'forbidden'; end if;
  select * into v_b from public.posing_bookings where id=p_booking_id for update;
  if not found then raise exception 'booking_not_found'; end if;
  if v_b.status='completed' then return jsonb_build_object('ok',true,'already',true); end if;
  if v_b.status<>'confirmed' then raise exception 'invalid_booking_status'; end if;
  select s.start_at+make_interval(mins=>coalesce(v_b.duration_minutes,pp.duration_minutes)) into v_end
    from public.availability_slots s join public.package_plans pp on pp.key=v_b.plan_key where s.id=v_b.slot_id;
  if v_end>now() then raise exception 'session_not_finished'; end if;
  update public.posing_bookings set status='completed',updated_at=now() where id=v_b.id;
  return jsonb_build_object('ok',true,'already',false);
end; $$;

create function public.posing_edit_slots(p_actor_id uuid,p_action text,p_entries jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_item jsonb; v_s public.availability_slots; v_start timestamptz; v_end timestamptz; v_count integer:=0;
begin
  perform pg_advisory_xact_lock(hashtext('posing:calendar'));
  if not exists(select 1 from public.profiles where id=p_actor_id and role='admin') then raise exception 'forbidden'; end if;
  if jsonb_typeof(p_entries)<>'array' or jsonb_array_length(p_entries)>100 then raise exception 'invalid_slots'; end if;
  for v_item in select value from jsonb_array_elements(p_entries) loop
    if p_action='create' then
      v_start:=(v_item->>'start_at')::timestamptz; v_end:=(v_item->>'end_at')::timestamptz;
      if v_start is null or v_end is null or v_start<=now() or v_end<=v_start or v_end-v_start>interval '120 minutes' then raise exception 'invalid_times'; end if;
      if exists(select 1 from public.availability_slots s where s.archived_at is null and s.start_at<v_end and s.end_at>v_start)
        or exists(select 1 from public.posing_bookings b join public.availability_slots s on s.id=b.slot_id
          join public.package_plans pp on pp.key=b.plan_key where b.status<>'cancelled' and s.start_at<v_end
          and s.start_at+make_interval(mins=>coalesce(b.duration_minutes,pp.duration_minutes))>v_start)
        then raise exception 'slot_overlap'; end if;
      insert into public.availability_slots(start_at,end_at,is_blocked) values(v_start,v_end,coalesce((v_item->>'is_blocked')::boolean,false)) returning * into v_s;
    elsif p_action in ('archive','block') then
      select * into v_s from public.availability_slots where id=(v_item->>'id')::uuid for update;
      if not found then raise exception 'slot_not_found'; end if;
      if v_s.archived_at is not null and p_action='archive' then continue; end if;
      if exists(select 1 from public.posing_bookings where slot_id=v_s.id and status<>'cancelled') then raise exception 'slot_has_booking'; end if;
      if p_action='block' and (v_item->>'is_blocked')::boolean and exists(select 1 from public.posing_bookings b
        join public.availability_slots s on s.id=b.slot_id join public.package_plans pp on pp.key=b.plan_key
        where b.status<>'cancelled' and s.start_at<v_s.end_at
          and s.start_at+make_interval(mins=>coalesce(b.duration_minutes,pp.duration_minutes))>v_s.start_at)
        then raise exception 'slot_has_booking'; end if;
      if p_action='archive' then update public.availability_slots set archived_at=now() where id=v_s.id;
      else
        if v_s.start_at<=now() or v_s.archived_at is not null then raise exception 'invalid_times'; end if;
        update public.availability_slots set is_blocked=(v_item->>'is_blocked')::boolean where id=v_s.id;
      end if;
    else raise exception 'invalid_action'; end if;
    v_count:=v_count+1;
  end loop;
  return jsonb_build_object('ok',true,'count',v_count,'slot',to_jsonb(v_s));
end; $$;

create function public.posing_available_slots(p_from timestamptz,p_to timestamptz,p_plan_key text default 'single')
returns jsonb language sql stable security invoker set search_path='' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'start_at',s.start_at,
    'end_at',s.start_at+make_interval(mins=>p.duration_minutes)) order by s.start_at),'[]'::jsonb)
  from public.availability_slots s join public.package_plans p on p.key=p_plan_key
  where s.archived_at is null and not s.is_blocked and s.start_at>=p_from and s.start_at<p_to and s.start_at>now()
    and not exists(select 1 from public.availability_slots blocked where blocked.is_blocked and blocked.archived_at is null
      and blocked.start_at<s.start_at+make_interval(mins=>p.duration_minutes) and blocked.end_at>s.start_at)
    and not exists(select 1 from public.posing_bookings b join public.availability_slots bs on bs.id=b.slot_id
      join public.package_plans bp on bp.key=b.plan_key where b.status<>'cancelled'
      and bs.start_at<s.start_at+make_interval(mins=>p.duration_minutes)
      and bs.start_at+make_interval(mins=>coalesce(b.duration_minutes,bp.duration_minutes))>s.start_at);
$$;

create function public.posing_admin_stats() returns jsonb language sql stable security invoker set search_path='' as $$
  select jsonb_build_object('members',(select count(*) from public.profiles where role<>'admin'),
    'pendingPayments',(select count(*) from public.posing_bookings where status='pending_payment'),
    'activePackages',(select count(*) from public.user_packages where status='active' and period_end>now()),
    'weekBookings',(select count(*) from public.posing_bookings b join public.availability_slots s on s.id=b.slot_id
      where b.status<>'cancelled' and s.start_at >= date_trunc('week',now() at time zone 'Europe/Athens') at time zone 'Europe/Athens'
      and s.start_at < (date_trunc('week',now() at time zone 'Europe/Athens')+interval '7 days') at time zone 'Europe/Athens'),
    'programPending',(select count(*) from public.moove_program_purchases where status='pending_payment'),
    'nutritionPending',(select count(*) from public.nutrition_plan_orders where status='pending_payment'));
$$;

create function public.posing_admin_bookings(p_status text default '',p_member uuid default null,p_from timestamptz default null,
  p_to timestamptz default null,p_search text default '',p_page integer default 1,p_page_size integer default 20,p_booking_id uuid default null)
returns jsonb language sql stable security invoker set search_path='' as $$
  with matching as (select b.*,jsonb_build_object('full_name',p.full_name,'email',p.email) as profiles,
    jsonb_build_object('start_at',s.start_at,'end_at',s.start_at+make_interval(mins=>coalesce(b.duration_minutes,pp.duration_minutes))) as slot
    from public.posing_bookings b join public.availability_slots s on s.id=b.slot_id join public.package_plans pp on pp.key=b.plan_key
    left join public.profiles p on p.id=b.user_id
    where (p_status='' or (p_status='non_cancelled' and b.status<>'cancelled') or b.status=p_status)
      and (p_member is null or b.user_id=p_member) and (p_from is null or s.start_at>=p_from) and (p_to is null or s.start_at<p_to)
      and (p_booking_id is null or b.id=p_booking_id)
      and (p_search='' or strpos(lower(coalesce(p.full_name,'')||' '||coalesce(p.email,'')),lower(p_search))>0)),
  page_rows as (select * from matching order by (slot->>'start_at')::timestamptz desc,id
    limit least(100,greatest(1,p_page_size)) offset (greatest(1,p_page)-1)*least(100,greatest(1,p_page_size)))
  select jsonb_build_object('bookings',coalesce((select jsonb_agg(to_jsonb(r)) from page_rows r),'[]'::jsonb),
    'total',(select count(*) from matching),'page',greatest(1,p_page),'pageSize',least(100,greatest(1,p_page_size)));
$$;

create function public.confirm_program_bundle(p_purchase_id uuid,p_payment_ref text,p_method text,p_actor_id uuid default null,
  p_include_nutrition boolean default false,p_access_token text default null,p_expected_nutrition_id uuid default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_p public.moove_program_purchases; v_orders jsonb; v_already boolean;
begin
  select * into v_p from public.moove_program_purchases where id=p_purchase_id for update;
  if not found then raise exception 'purchase_not_found'; end if;
  if p_expected_nutrition_id is not null and not exists(select 1 from public.nutrition_plan_orders
    where id=p_expected_nutrition_id and program_purchase_id=v_p.id and status in ('pending_payment','paid','generation_failed'))
    then raise exception 'invalid_nutrition_order'; end if;
  if v_p.status not in ('pending_payment','paid') then raise exception 'invalid_purchase_status'; end if;
  v_already:=v_p.status='paid';
  if not v_already then
    update public.moove_program_purchases set status='paid',payment_method=p_method,confirmed_by=p_actor_id,
      stripe_session_id=case when p_method='stripe' then p_payment_ref else stripe_session_id end,
      access_token=p_access_token,delivery_status='pending',updated_at=now() where id=v_p.id returning * into v_p;
  end if;
  if p_include_nutrition then
    update public.nutrition_plan_orders set status='paid',payment_method=p_method,confirmed_by=p_actor_id,
      stripe_session_id=case when p_method='stripe' then p_payment_ref else stripe_session_id end,
      delivery_status='pending',updated_at=now() where program_purchase_id=v_p.id and status='pending_payment';
    select coalesce(jsonb_agg(to_jsonb(n)),'[]'::jsonb) into v_orders from public.nutrition_plan_orders n
      where program_purchase_id=v_p.id and status in ('paid','generation_failed');
  end if;
  return jsonb_build_object('ok',true,'already',v_already,'purchase',to_jsonb(v_p),'nutritionOrders',coalesce(v_orders,'[]'::jsonb));
end; $$;

create function public.posing_capture_payment() returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if new.status='active' and new.paid_at is null and new.stripe_payment_id is not null
    and (new.stripe_payment_id is distinct from old.stripe_payment_id or old.status='pending_payment') then
    new.paid_at:=now(); new.paid_at_source:='recorded';
    new.payment_method:=coalesce(new.payment_method,case when new.stripe_payment_id like 'manual:%' then 'manual' else 'stripe' end);
    new.bonus_sessions:=public.posing_bonus_sessions(new.user_id,new.plan_key,new.paid_at,new.id);
    new.sessions_total:=new.base_sessions+new.bonus_sessions+new.session_adjustment;
  end if;
  return new;
end; $$;
create trigger posing_capture_payment before update on public.user_packages
  for each row execute function public.posing_capture_payment();

-- Client profile editing cannot grant the new billing controls to its author.
create function public.posing_protect_profile_role() returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if new.role is distinct from old.role and current_user not in ('postgres','supabase_admin','service_role') then
    raise exception 'forbidden';
  end if;
  return new;
end; $$;
create trigger posing_protect_profile_role before update on public.profiles
  for each row execute function public.posing_protect_profile_role();

-- These RPCs are backend APIs; they must never be callable by browser roles.
revoke insert,update,delete on public.user_packages, public.posing_bookings from anon,authenticated;
do $$ declare r record; begin
  for r in select oid::regprocedure as signature from pg_proc where pronamespace='public'::regnamespace
    and proname in ('posing_bonus_sessions','posing_reserve_booking','posing_activate_payment','posing_cancel_booking',
      'posing_cancel_package','posing_adjust_sessions','posing_complete_booking','posing_edit_slots','posing_available_slots',
      'posing_admin_stats','posing_admin_bookings','confirm_program_bundle','posing_package_components',
      'posing_capture_payment','posing_protect_profile_role') loop
    execute format('revoke all on function %s from public, anon, authenticated',r.signature);
    execute format('grant execute on function %s to service_role',r.signature);
  end loop;
end; $$;
