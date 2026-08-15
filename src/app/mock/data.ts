import type { HeldRecord, PastSell, Plan } from '../lib/types'

/** Phase A 목데이터 — Supabase 연결 전 UI 개발용 */

export const mockPlans: Plan[] = [
  {
    id: 'plan-1',
    symbol: '005930',
    symbolName: '삼성전자',
    entryPrice: 70_000,
    quantity: 50,
    stopPct: 8,
    takePct: 20,
    horizonDays: 60,
    reason: 'HBM 수주 확대로 4분기 실적 개선 예상. 실적 발표까지 보유.',
    originStopPct: 8,
    originTakePct: 20,
    originHorizonDays: 60,
    status: 'active', // 진행 62% 부근
    createdAt: '2026-07-20T09:00:00Z',
  },
  {
    id: 'plan-2',
    symbol: '000660',
    symbolName: 'SK하이닉스',
    entryPrice: 180_000,
    quantity: 10,
    stopPct: 10,
    takePct: 25,
    horizonDays: 90,
    reason: 'AI 메모리 수요 사이클 상단까지 보유. 분기 실적 두 번 확인.',
    originStopPct: 10,
    originTakePct: 25,
    originHorizonDays: 90,
    status: 'active', // 진행 85% — 블러 대상
    createdAt: '2026-06-01T09:00:00Z',
  },
  {
    id: 'plan-3',
    symbol: '035420',
    symbolName: 'NAVER',
    entryPrice: 195_000,
    quantity: 15,
    stopPct: 0, // 야생알: 계획 없이 들어온 보유분 (손절/익절 미설정)
    takePct: 0,
    horizonDays: 0,
    reason: '',
    originStopPct: 0,
    originTakePct: 0,
    originHorizonDays: 0,
    status: 'active',
    createdAt: '2026-08-10T09:00:00Z',
  },
  {
    id: 'plan-4',
    symbol: '035720',
    symbolName: '카카오',
    entryPrice: 48_000,
    quantity: 100,
    stopPct: 12,
    takePct: 15,
    horizonDays: 30,
    reason: '단기 반등 노림. 한 달 안에 결론.',
    originStopPct: 12,
    originTakePct: 15,
    originHorizonDays: 30,
    status: 'expired', // 만기 도달 — 재계약 or 종료 선택 대기
    createdAt: '2026-07-10T09:00:00Z',
    endedAt: '2026-08-09T09:00:00Z',
  },
  {
    id: 'plan-5',
    symbol: '373220',
    symbolName: 'LG에너지솔루션',
    entryPrice: 420_000,
    quantity: 3,
    stopPct: 7,
    takePct: 18,
    horizonDays: 45,
    reason: '전기차 수요 회복 베팅.',
    originStopPct: 7,
    originTakePct: 18,
    originHorizonDays: 45,
    status: 'stopped', // 손절선 작동 = 보험이 일한 것 (실패 아님)
    createdAt: '2026-07-01T09:00:00Z',
    endedAt: '2026-08-02T09:00:00Z',
  },
]

/** 목 현재가 (Phase C에서 실제 시세로 대체) */
export const mockPrices: Record<string, number> = {
  '005930': 78_000, // 삼성전자 → 진행률 ≈ 0.69
  '000660': 218_000, // SK하이닉스 → 진행률 ≈ 0.86 (블러)
  '035420': 201_000,
  '035720': 45_500,
  '373220': 388_000,
}

/** 참은 기록 (열매) */
export const mockHeldRecords: HeldRecord[] = [
  {
    id: 'held-1',
    planId: 'plan-1',
    kind: 'hold_sell',
    priceAt: 66_500,
    outcomePct: 17.3, // 참은 뒤 +17.3% — 참길 잘했다
    createdAt: '2026-07-28T10:30:00Z',
  },
  {
    id: 'held-2',
    planId: 'plan-2',
    kind: 'hold_sell',
    priceAt: 210_000,
    createdAt: '2026-08-12T14:00:00Z', // 아직 채점 전
  },
  {
    id: 'held-3',
    planId: 'plan-1',
    kind: 'hold_buy',
    priceAt: 76_000,
    outcomePct: 2.6,
    createdAt: '2026-08-05T11:00:00Z',
  },
]

/**
 * 과거 매도 12건 — 매도 개입 화면에서 "당신의 과거" 카드로 제시.
 * afterPct: 매도 후 30일, 계속 들고 있었다면의 수익률.
 * 양수가 많다 = 일찍 파는 습관. 반례(음수)도 섞어 정직하게 보여준다.
 */
export const mockPastSells: PastSell[] = [
  { id: 'ps-1', symbolName: '삼성전자', soldAt: '2026-02-10', afterPct: 11.2 },
  { id: 'ps-2', symbolName: '카카오', soldAt: '2026-02-24', afterPct: 6.8 },
  { id: 'ps-3', symbolName: 'NAVER', soldAt: '2026-03-05', afterPct: -4.1 },
  { id: 'ps-4', symbolName: '현대차', soldAt: '2026-03-18', afterPct: 9.4 },
  { id: 'ps-5', symbolName: 'SK하이닉스', soldAt: '2026-04-02', afterPct: 21.7 },
  { id: 'ps-6', symbolName: '기아', soldAt: '2026-04-15', afterPct: 3.2 },
  { id: 'ps-7', symbolName: 'POSCO홀딩스', soldAt: '2026-04-29', afterPct: -7.9 },
  { id: 'ps-8', symbolName: '셀트리온', soldAt: '2026-05-12', afterPct: 8.1 },
  { id: 'ps-9', symbolName: '삼성SDI', soldAt: '2026-05-27', afterPct: 5.5 },
  { id: 'ps-10', symbolName: 'LG화학', soldAt: '2026-06-09', afterPct: -2.3 },
  { id: 'ps-11', symbolName: '한화에어로스페이스', soldAt: '2026-06-24', afterPct: 14.6 },
  { id: 'ps-12', symbolName: '두산에너빌리티', soldAt: '2026-07-08', afterPct: 7.7 },
]
