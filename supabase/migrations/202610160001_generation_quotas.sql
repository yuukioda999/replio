-- Replio Free plan: 20 successful/reserved generations per UTC calendar month.
-- Functions are SECURITY DEFINER and callable only by the server-side service_role.
create table if not exists public.generation_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  used_count integer not null default 0 check (used_count >= 0),
  primary key (user_id, period_start)
);

create table if not exists public.generation_reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  refunded boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists generation_reservations_user_created_idx on public.generation_reservations(user_id, created_at desc);
alter table public.generation_usage enable row level security;
alter table public.generation_reservations enable row level security;
revoke all on public.generation_usage from anon, authenticated;
revoke all on public.generation_reservations from anon, authenticated;

create or replace function public.reserve_generation(p_user_id uuid)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  v_period date := date_trunc('month', timezone('utc', now()))::date;
  v_used integer;
  v_id uuid;
begin
  if auth.role() <> 'service_role' then raise exception 'forbidden'; end if;
  insert into public.generation_usage(user_id, period_start, used_count)
  values (p_user_id, v_period, 0) on conflict do nothing;
  update public.generation_usage set used_count = used_count + 1
  where user_id = p_user_id and period_start = v_period and used_count < 20
  returning used_count into v_used;
  if v_used is null then return null; end if;
  insert into public.generation_reservations(user_id, period_start)
  values (p_user_id, v_period) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.refund_generation(p_reservation_id uuid, p_user_id uuid)
returns void language plpgsql security definer set search_path = ''
as $$
declare v_period date;
begin
  if auth.role() <> 'service_role' then raise exception 'forbidden'; end if;
  update public.generation_reservations set refunded = true
  where id = p_reservation_id and user_id = p_user_id and refunded = false
  returning period_start into v_period;
  if v_period is not null then
    update public.generation_usage set used_count = greatest(0, used_count - 1)
    where user_id = p_user_id and period_start = v_period;
  end if;
end;
$$;

revoke all on function public.reserve_generation(uuid) from public, anon, authenticated;
revoke all on function public.refund_generation(uuid,uuid) from public, anon, authenticated;
grant execute on function public.reserve_generation(uuid) to service_role;
grant execute on function public.refund_generation(uuid,uuid) to service_role;
