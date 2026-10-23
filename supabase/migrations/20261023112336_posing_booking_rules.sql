-- Booking rules: unpaid bookings lapse, package validity grows with its sessions.
-- Unpaid bookings release their slot 3 hours after reservation, or when the session starts
-- if that is sooner. Rows reserved before this migration keep payment_expires_at null and
-- never lapse, unless their session time has already passed.
alter table public.posing_bookings
  add column if not exists payment_expires_at timestamptz,
  add column if not exists cancelled_reason text;
alter table public.user_packages add column if not exists payment_expires_at timestamptz;
alter table public.posing_bookings add constraint posing_booking_cancelled_reason
  check (cancelled_reason is null or cancelled_reason in ('payment_expired','payment_credited'));
create index if not exists posing_bookings_pending_expiry_idx on public.posing_bookings(payment_expires_at)
  where status='pending_payment';

update public.posing_bookings b set payment_expires_at=s.start_at from public.availability_slots s
  where s.id=b.slot_id and b.status='pending_payment' and b.payment_expires_at is null and s.start_at<=now();
update public.user_packages up set payment_expires_at=b.payment_expires_at from public.posing_bookings b
  where b.user_package_id=up.id and b.status='pending_payment' and b.payment_expires_at is not null
    and up.status='pending_payment' and up.payment_expires_at is null;

-- Package validity: a month covers up to 4 sessions and every session beyond that,
-- bonus and admin-added ones included, adds a week. Plans sold with a longer period keep it.
create function public.posing_package_period(p_plan_key text,p_sessions_total integer) returns interval
language sql stable security invoker set search_path='' as $$
  select greatest(make_interval(days=>pp.period_days),
    make_interval(days=>30+7*greatest(0,p_sessions_total-4)))
  from public.package_plans pp where pp.key=p_plan_key;
$$;

-- Packages still running pick up the extra weeks; ones that already ended stay ended.
update public.user_packages up
  set period_end=up.period_start+public.posing_package_period(up.plan_key,up.sessions_total),updated_at=now()
  where up.status in ('active','pending_payment') and up.period_end>now() and up.period_start is not null
    and up.period_start+public.posing_package_period(up.plan_key,up.sessions_total)>up.period_end;

-- 15 minutes of grace absorbs a Stripe webhook that lands just after the deadline.
create function public.posing_payment_lapsed(p_expires_at timestamptz) returns boolean
language sql stable security invoker set search_path='' as $$
  select p_expires_at is not null and p_expires_at + interval '15 minutes' <= now();
$$;

create function public.posing_expire_pending_payments() returns integer
language plpgsql security invoker set search_path='' as $$
declare v_count integer;
begin
  perform pg_advisory_xact_lock(hashtext('posing:calendar'));
  with expired as (
    update public.posing_bookings set status='cancelled',cancelled_reason='payment_expired',updated_at=now()
    where status='pending_payment' and public.posing_payment_lapsed(payment_expires_at)
    returning user_package_id),
  packages as (
    update public.user_packages up set status='cancelled',updated_at=now()
    from expired e where up.id=e.user_package_id and up.status='pending_payment' returning up.id)
  select count(*) into v_count from expired;
  return v_count;
end; $$;

create or replace function public.posing_reserve_booking(p_user_id uuid,p_slot_id uuid,p_plan_key text,p_locale text,p_amount_eur integer)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_slot public.availability_slots; v_plan public.package_plans; v_pkg public.user_packages;
  v_booking public.posing_bookings; v_end timestamptz; v_bonus integer; v_existing boolean:=false;
  v_expires timestamptz:=now()+interval '3 hours'; v_period interval;
begin
  perform pg_advisory_xact_lock(hashtext('posing:calendar'));
  perform public.posing_expire_pending_payments();
  select * into v_slot from public.availability_slots where id=p_slot_id for update;
  if not found or v_slot.is_blocked or v_slot.archived_at is not null then raise exception 'slot_not_found'; end if;
  if v_slot.start_at <= now() then raise exception 'slot_in_past'; end if;
  v_expires:=least(v_expires,v_slot.start_at);
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
    v_bonus:=public.posing_bonus_sessions(p_user_id,p_plan_key,now());
    v_period:=public.posing_package_period(p_plan_key,v_plan.sessions_total+v_bonus);
    if v_end>now()+v_period then raise exception 'outside_package_period'; end if;
    insert into public.user_packages(user_id,plan_key,base_sessions,bonus_sessions,sessions_total,sessions_used,
      status,period_start,period_end,amount_eur,payment_expires_at)
      values(p_user_id,p_plan_key,v_plan.sessions_total,v_bonus,v_plan.sessions_total+v_bonus,0,
        'pending_payment',now(),now()+v_period,p_amount_eur,v_expires) returning * into v_pkg;
  end if;
  insert into public.posing_bookings(user_id,slot_id,plan_key,user_package_id,status,locale,amount_eur,duration_minutes,payment_expires_at)
    values(p_user_id,p_slot_id,p_plan_key,v_pkg.id,case when v_existing then 'confirmed' else 'pending_payment' end,
      case when p_locale='en' then 'en' else 'el' end,p_amount_eur,v_plan.duration_minutes,
      case when v_existing then null else v_expires end) returning * into v_booking;
  return jsonb_build_object('ok',true,'booking',to_jsonb(v_booking),'userPackage',to_jsonb(v_pkg),
    'booking_type',case when v_existing then 'included_session' else 'new_package' end,
    'sessions_remaining',greatest(0,v_pkg.sessions_total-v_pkg.sessions_used));
end; $$;

-- A payment for a booking that was cancelled or lapsed turns its package into paid credit:
-- every session stays available and the member picks a new time.
create or replace function public.posing_activate_payment(p_booking_id uuid,p_package_id uuid,p_payment_ref text,
  p_method text,p_actor_id uuid default null,p_paid_at timestamptz default now())
returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_b public.posing_bookings; v_p public.user_packages; v_period interval; v_bonus integer;
begin
  perform pg_advisory_xact_lock(hashtext('posing:calendar'));
  select * into v_b from public.posing_bookings where id=p_booking_id for update;
  if not found then raise exception 'booking_not_found'; end if;
  if p_package_id is not null and p_package_id is distinct from v_b.user_package_id then raise exception 'invalid_package'; end if;
  select * into v_p from public.user_packages where id=v_b.user_package_id for update;
  if not found then raise exception 'package_not_found'; end if;
  if v_b.status in ('confirmed','completed','cancelled') and v_p.paid_at is not null then return jsonb_build_object('ok',true,'already',true); end if;
  v_bonus:=public.posing_bonus_sessions(v_p.user_id,v_p.plan_key,p_paid_at,v_p.id);
  v_period:=public.posing_package_period(v_p.plan_key,v_p.base_sessions+v_bonus+v_p.session_adjustment);
  if v_b.status='cancelled' then
    if v_p.status not in ('pending_payment','cancelled') then raise exception 'invalid_package_status'; end if;
    update public.user_packages set status='active',stripe_payment_id=p_payment_ref,payment_method=p_method,
      confirmed_by=p_actor_id,paid_at=p_paid_at,paid_at_source='recorded',bonus_sessions=v_bonus,
      sessions_total=base_sessions+v_bonus+session_adjustment,
      sessions_used=(select count(*) from public.posing_bookings where user_package_id=v_p.id and status in ('confirmed','completed')),
      payment_expires_at=null,period_start=p_paid_at,period_end=p_paid_at+v_period,updated_at=now()
      where id=v_p.id;
    update public.posing_bookings set cancelled_reason='payment_credited',updated_at=now() where id=v_b.id;
    return jsonb_build_object('ok',true,'already',false,'credit_only',true);
  end if;
  if v_b.status<>'pending_payment' then raise exception 'invalid_booking_status'; end if;
  if v_p.status not in ('pending_payment','active') then raise exception 'invalid_package_status'; end if;
  update public.user_packages set status='active',stripe_payment_id=p_payment_ref,payment_method=p_method,
    confirmed_by=p_actor_id,paid_at=p_paid_at,paid_at_source='recorded',bonus_sessions=v_bonus,
    sessions_total=base_sessions+v_bonus+session_adjustment,
    sessions_used=(select count(*) from public.posing_bookings where user_package_id=v_p.id and status in ('confirmed','completed'))+1,
    payment_expires_at=null,period_start=p_paid_at,period_end=p_paid_at+v_period,updated_at=now() where id=v_p.id;
  update public.posing_bookings set status='confirmed',stripe_session_id=p_payment_ref,payment_expires_at=null,updated_at=now() where id=v_b.id;
  return jsonb_build_object('ok',true,'already',false,'credit_only',false);
end; $$;

-- Adding or removing a session moves the expiry by the same rule.
create or replace function public.posing_adjust_sessions(p_package_id uuid,p_actor_id uuid,p_delta integer,p_reason text,p_request_id uuid)
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
  update public.user_packages set sessions_total=sessions_total+p_delta,session_adjustment=session_adjustment+p_delta,
    period_end=period_start+public.posing_package_period(plan_key,sessions_total+p_delta),updated_at=now() where id=v_p.id;
  insert into public.posing_session_adjustments(user_package_id,actor_id,delta,reason,total_before,total_after,request_id)
    values(v_p.id,p_actor_id,p_delta,trim(p_reason),v_p.sessions_total,v_p.sessions_total+p_delta,p_request_id);
  return jsonb_build_object('ok',true,'already',false);
end; $$;

create or replace function public.posing_available_slots(p_from timestamptz,p_to timestamptz,p_plan_key text default 'single')
returns jsonb language sql stable security invoker set search_path='' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'start_at',s.start_at,
    'end_at',s.start_at+make_interval(mins=>p.duration_minutes)) order by s.start_at),'[]'::jsonb)
  from public.availability_slots s join public.package_plans p on p.key=p_plan_key
  where s.archived_at is null and not s.is_blocked and s.start_at>=p_from and s.start_at<p_to and s.start_at>now()
    and not exists(select 1 from public.availability_slots blocked where blocked.is_blocked and blocked.archived_at is null
      and blocked.start_at<s.start_at+make_interval(mins=>p.duration_minutes) and blocked.end_at>s.start_at)
    and not exists(select 1 from public.posing_bookings b join public.availability_slots bs on bs.id=b.slot_id
      join public.package_plans bp on bp.key=b.plan_key where b.status<>'cancelled'
      and not (b.status='pending_payment' and public.posing_payment_lapsed(b.payment_expires_at))
      and bs.start_at<s.start_at+make_interval(mins=>p.duration_minutes)
      and bs.start_at+make_interval(mins=>coalesce(b.duration_minutes,bp.duration_minutes))>s.start_at);
$$;

do $$ declare r record; begin
  for r in select oid::regprocedure as signature from pg_proc where pronamespace='public'::regnamespace
    and proname in ('posing_payment_lapsed','posing_expire_pending_payments','posing_reserve_booking',
      'posing_activate_payment','posing_available_slots','posing_package_period','posing_adjust_sessions') loop
    execute format('revoke all on function %s from public, anon, authenticated',r.signature);
    execute format('grant execute on function %s to service_role',r.signature);
  end loop;
end; $$;
