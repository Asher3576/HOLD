/** UI 데이터 모델 — design_handoff_hold v5 기준 */

export type EggStage = 'plain' | 'crack' | 'wild' | 'creature' | 'expiry' | 'shield'

export interface Egg {
  id: string
  name: string
  qty: string
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
