-- 서버 공유 캐시 (KIS 접근토큰 등) — service role 전용.
-- RLS 활성 + 정책 없음 = 일반 사용자(anon/authenticated)는 접근 불가, 엣지 함수만 사용.

create table if not exists public.app_cache (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_cache enable row level security;
