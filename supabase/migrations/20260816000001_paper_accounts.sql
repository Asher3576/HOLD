-- Phase B: 모의 계좌 + 선반 정리 마커

create table if not exists public.paper_accounts (
  user_id uuid primary key references auth.users,
  cash numeric not null default 10000000, -- 시드 현금 1,000만 (임의)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.paper_accounts enable row level security;

create policy "paper_accounts_own" on public.paper_accounts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 보험 작동(stopped) 알을 선반에서 정리한 시각 (기록은 유지, 표시만 제외)
alter table public.plans add column if not exists dismissed_at timestamptz;
