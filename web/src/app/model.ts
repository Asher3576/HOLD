/** UI 데이터 모델 — design_handoff_hold v5 기준 */

export type EggStage = 'plain' | 'crack' | 'wild' | 'creature' | 'expiry' | 'shield'

export interface Egg {
  id: string
  name: string
  qty: string
  /** 보유 수량 (숫자) — 모의 계좌 평가액 계산용 */
  qtyN?: number
  /** 종목 코드 (KR 6자리) — 실시세 매핑. 없으면 목데이터로만 동작 */
  code?: string
  /** 모의 매수 진입가 (원) */
  entry?: number
  /** 실시세 현재가 (quotes 수신 시 갱신) */
  price?: number
  /** DB에서 온 실데이터 알 (목 진입가 리베이스 대상 아님) */
  real?: boolean
  /** 손절선 % (양수 저장, −표기) */
  stop?: number
  /** 익절선 % */
  target?: number
  days?: number
  elapsed?: number
  /** 손절선 0 ~ 익절선 100 진행률 */
  prog?: number
  stage: EggStage
  /** 사육 레벨 (부화 이력) */
  lv?: number
  reason?: string
  /** 과거의 나 카드: "9월 4일의 너" */
  memoL?: string
  memoQ?: string
}

export interface SellRec {
  n: string
  d: string
  up: boolean
}

export type FruitKind = 'ripe' | 'wilt' | 'pend'

export interface Fruit {
  name: string
  kind: FruitKind
  dir: string
  note: string
}

export interface NewsItem {
  tag: string
  headline: string
  rel: boolean
}

export type VaultPhase = 'rest' | 'dialing' | 'open' | 'closing'
export type SheetKind = 'detail' | 'sell' | 'plan' | 'review'
export type PlanMode = 'new' | 'wild' | 'renew'

/** 금고 마찰: 열림 시간 = DIAL_BASE + 회차 × DIAL_STEP (초) */
export const DIAL_BASE = 1.5
export const DIAL_STEP = 0.4
/** 매도 확정 전 카운트다운 (초) */
export const SELL_COUNTDOWN = 15

/** 모의 계좌 시드 현금 (임의 금액) */
export const SEED_CASH = 10_000_000

/** 종목명 → KR 코드 (실시세 매핑) */
export const SYMBOL_CODE: Record<string, string> = {
  삼성전자: '005930',
  SK하이닉스: '000660',
  NAVER: '035420',
  카카오: '035720',
  LG에너지솔루션: '373220',
}

/** 시세 코드 해석: 알려진 한국 종목명 → 6자리 코드, 미국 티커(영대문자)는 그대로 */
export function codeFor(name: string): string | undefined {
  const n = name.trim()
  if (!n) return undefined
  if (SYMBOL_CODE[n]) return SYMBOL_CODE[n]
  if (/^[A-Z][A-Z.]{0,5}$/.test(n)) return n // TSLA, AAPL 등
  return undefined
}
