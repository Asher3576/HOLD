-- HOLD 초기 스키마 v2 — 앱(알·열매·복기) + 크롬 확장(브리핑·레벨·손익비 코치)
-- 원칙: 실거래 없음(주문 테이블 없음), 사용자 API 키 저장 안 함,
--       스크린샷 원본 저장 안 함(분석 결과 facts만 남긴다).

-- ─── 앱 코어: 계획(알) ──────────────────────────────────────────────────────

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
  outcome_pct numeric, -- 참은 뒤 결과 % — 채점 크론이 채움
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

-- ─── 시세: OHLCV 캔들 ───────────────────────────────────────────────────────
-- 종가만으로는 지지/저항 스윙·ADX 를 못 구한다 → 캔들로 저장.
-- timeframe: '1d' 기본, 확장 라이브 코멘트 단계에서 '60m'/'15m' 추가.

create table if not exists public.candles (
  symbol text not null,
  timeframe text not null default '1d',
  ts timestamptz not null,
  open numeric not null,
  high numeric not null,
  low numeric not null,
  close numeric not null,
  volume numeric,
  primary key (symbol, timeframe, ts)
);

-- ─── 크롬 확장 ──────────────────────────────────────────────────────────────

-- 분석 기록: 확장이 한 번 브리핑/레벨/손익비 점검을 한 단위.
-- facts = 서버가 결정적으로 계산한 수치(레벨·터치 횟수·ADX·손익비 등),
-- comment = LLM 이 facts 만 인용해 쓴 문장. 스크린샷 원본은 저장하지 않는다.
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  symbol text not null,
  source_host text,   -- 어느 사이트 차트였나 (tradingview.com 등) — URL 전체는 저장 안 함
  timeframe text,
  kind text not null check (kind in ('briefing', 'levels', 'rr_check')),
  facts jsonb not null,
  comment text,
  created_at timestamptz not null default now()
);

-- 지지/저항 레벨 캐시 — 사용자 무관, 심볼×타임프레임 단위로 재사용 (ai_drawings 의 20h 갱신 패턴)
create table if not exists public.levels_cache (
  symbol text not null,
  timeframe text not null,
  levels jsonb not null, -- [{price, kind: 'support'|'resistance', strength, touches, basis}]
  computed_at timestamptz not null default now(),
  primary key (symbol, timeframe)
);

-- 손익비 사전점검 — 알(plan)의 씨앗. 확장에서 점검 후 "이대로 알 만들기"로 전환
create table if not exists public.rr_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  symbol text not null,
  direction text not null default 'up' check (direction in ('up', 'down')),
  entry_price numeric not null,
  stop_price numeric not null,
  target_price numeric not null,
  rr_ratio numeric,   -- 서버 계산 손익비 (LLM 아님)
  context jsonb,      -- 점검 시점 지표 스냅샷 (ADX·레벨 거리 등)
  linked_plan_id uuid references public.plans, -- 점검이 알로 이어졌으면 연결
  created_at timestamptz not null default now()
);

-- 방향 판단 이력 → 적중률 ("당신의 TSLA 상승 적중률 34%")
-- plan/rr_check 생성 시 자동 파생, 채점 크론이 만기 시점 가격으로 outcome 확정.
create table if not exists public.calls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  symbol text not null,
  direction text not null check (direction in ('up', 'down')),
  basis text not null check (basis in ('plan', 'rr_check', 'manual')),
  ref_id uuid,        -- plans.id 또는 rr_checks.id
  price_at numeric not null,
  horizon_days int not null,
  outcome text not null default 'pending' check (outcome in ('hit', 'miss', 'pending')),
  outcome_pct numeric,
  made_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- ─── RLS ────────────────────────────────────────────────────────────────────

alter table public.plans enable row level security;
alter table public.plan_changes enable row level security;
alter table public.held_records enable row level security;
alter table public.reviews enable row level security;
alter table public.candles enable row level security;
alter table public.analyses enable row level security;
alter table public.levels_cache enable row level security;
alter table public.rr_checks enable row level security;
alter table public.calls enable row level security;

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

create policy "analyses_own" on public.analyses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "rr_checks_own" on public.rr_checks
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "calls_own" on public.calls
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 시세·레벨 캐시: 로그인 사용자 읽기 전용 (쓰기는 service role 크론만)
create policy "candles_read" on public.candles
  for select using (auth.role() = 'authenticated');

create policy "levels_cache_read" on public.levels_cache
  for select using (auth.role() = 'authenticated');

-- ─── 인덱스 ─────────────────────────────────────────────────────────────────

create index if not exists idx_plans_user on public.plans (user_id, status);
create index if not exists idx_held_user on public.held_records (user_id, created_at desc);
create index if not exists idx_changes_plan on public.plan_changes (plan_id, created_at desc);
create index if not exists idx_analyses_user on public.analyses (user_id, created_at desc);
create index if not exists idx_rr_checks_user on public.rr_checks (user_id, created_at desc);
create index if not exists idx_calls_user_symbol on public.calls (user_id, symbol, direction);
create index if not exists idx_calls_pending on public.calls (outcome) where outcome = 'pending';
