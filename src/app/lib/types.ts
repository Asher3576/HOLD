/** 계획(알)의 상태 — active: 품는 중, hatched: 완주 부화, stopped: 손절선 작동(보험),
 *  sold_early: 계획 밖 조기 매도, expired: 만기 도달(재계약 대기) */
export type PlanStatus = 'active' | 'hatched' | 'stopped' | 'sold_early' | 'expired'

export interface Plan {
  id: string
  symbol: string
  symbolName: string
  entryPrice: number
  quantity: number
  /** 손절선: 진입가 대비 하락 허용 % (양수로 저장, 8 → -8%) */
  stopPct: number
  /** 익절선: 진입가 대비 목표 상승 % */
  takePct: number
  horizonDays: number
  reason: string
  /** 원안(첫 계획) 값 — 계획 이완 지수 계산용. 수정해도 이 값은 불변 */
  originStopPct: number
  originTakePct: number
  originHorizonDays: number
  status: PlanStatus
  createdAt: string
  endedAt?: string
}

/** 매도/추매 충동을 참은 기록 (열매) */
export interface HeldRecord {
  id: string
  planId: string
  kind: 'hold_sell' | 'hold_buy'
  priceAt: number
  /** 참은 시점 이후 결과 % (채점 전이면 undefined) */
  outcomePct?: number
  createdAt: string
}

/** 과거 매도 이력 — 매도 개입 화면에서 "당신의 과거"로 제시 */
export interface PastSell {
  id: string
  symbolName: string
  soldAt: string
  /** 매도 후 30일 시점, 그 자리에서 더 들고 있었다면의 수익률 % */
  afterPct: number
}
