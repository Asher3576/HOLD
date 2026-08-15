-- HOLD 초기 스키마
-- 원칙: 실거래 미지원(주문 테이블 없음), 사용자 API 키 저장 안 함.

-- 계획(알)
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  symbol text not null,
  symbol_name text,
  entry_price numeric,
  quantity numeric,
  stop_pct numeric not null,
  take_pct numeric not null,
  horizon_days int not null,
  reason text not null,
  -- 원안(첫 계획) — 수정돼도 불변. 계획 이완 지수의 기준점.
  origin_stop_pct numeric not null,
  origin_take_pct numeric not null,
  origin_horizon_days int not null,
  status text not null default 'active'
    check (status in ('active', 'hatched', 'stopped', 'sold_early', 'expired')),
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

-- 계획 수정 이력 — 수정 자체는 막지 않되 이유를 반드시 남긴다
create table if not exists public.plan_changes (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references public.plans on delete cascade not null,
  field text not null,
  old_val numeric,
  new_val numeric,
  reason text not null,
  -- 수정 시점의 가격 하락률 (하락장에서 손절선을 푸는 패턴 탐지용)
  price_drop_pct numeric,
  created_at timestamptz not null default now()
);

-- 참은 기록 (열매) — 매도/추매 충동을 참은 순간
create table if not exists public.held_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  plan_id uuid references public.plans on delete cascade not null,
  kind text not null check (kind in ('hold_sell', 'hold_buy')),
  price_at numeric not null,
  -- 참은 뒤 결과 % — Phase C 채점 크론이 채움
  outcome_pct numeric,
  created_at timestamptz not null default now()
);

-- 복기 세션
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  plan_id uuid references public.plans on delete cascade not null,
  trigger_tag text,
  thesis_state text,
  emotion_tag text,
  transcript jsonb,
  created_at timestamptz not null default now()
);

-- 일봉 종가 캐시 (채점·유령 곡선용, Phase C)
create table if not exists public.prices_daily (
  symbol text not null,
  date date not null,
  close numeric not null,
  primary key (symbol, date)
);

-- RLS: 본인 데이터만
alter table public.plans enable row level security;
alter table public.plan_changes enable row level security;
alter table public.held_records enable row level security;
alter table public.reviews enable row level security;
alter table public.prices_daily enable row level security;

create policy "plans_own" on public.plans
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "plan_changes_own" on public.plan_changes
  for all using (
    exists (select 1 from public.plans p where p.id = plan_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.plans p where p.id = plan_id and p.user_id = auth.uid())
  );

create policy "held_records_own" on public.held_records
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "reviews_own" on public.reviews
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 시세는 모든 로그인 사용자가 읽기만 (쓰기는 service role 크론만)
create policy "prices_read" on public.prices_daily
  for select using (auth.role() = 'authenticated');

create index if not exists idx_plans_user on public.plans (user_id, status);
create index if not exists idx_held_user on public.held_records (user_id, created_at desc);
create index if not exists idx_changes_plan on public.plan_changes (plan_id, created_at desc);
