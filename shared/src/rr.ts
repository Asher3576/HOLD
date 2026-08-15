/**
 * 손익비(R:R) 계산 — 확장 "손익비 코치"의 핵심 순수 로직.
 * StockersClub pretrade_coach 의 planRR 개념과 동일: 서버/클라 어디서든
 * 결정적으로 계산하고, LLM 은 이 숫자를 인용해 문장만 쓴다.
 */

export interface RrInput {
  direction: 'up' | 'down'
  entryPrice: number
  stopPrice: number
  targetPrice: number
}

export interface RrResult {
  /** 보상 폭 % (진입가 대비, 방향 기준 +) */
  rewardPct: number
  /** 위험 폭 % (진입가 대비, +) */
  riskPct: number
  /** 손익비 = 보상/위험. 위험이 0 이하(손절이 진입보다 유리한 쪽)면 null */
  ratio: number | null
}

export function rrRatio(input: RrInput): RrResult {
  const { direction, entryPrice, stopPrice, targetPrice } = input
  const sign = direction === 'up' ? 1 : -1
  const rewardPct = ((targetPrice - entryPrice) / entryPrice) * 100 * sign
  const riskPct = ((entryPrice - stopPrice) / entryPrice) * 100 * sign
  if (riskPct <= 0) return { rewardPct: round2(rewardPct), riskPct: round2(riskPct), ratio: null }
  return {
    rewardPct: round2(rewardPct),
    riskPct: round2(riskPct),
    ratio: round2(rewardPct / riskPct),
  }
}

/** 방향 판단 이력 → 적중률 ("당신의 TSLA 상승 적중률 34%") */
export function hitRate(outcomes: Array<'hit' | 'miss'>): {
  total: number
  hits: number
  /** 0~100 정수 %. 표본 없으면 null */
  pct: number | null
} {
  const total = outcomes.length
  const hits = outcomes.filter((o) => o === 'hit').length
  return { total, hits, pct: total === 0 ? null : Math.round((hits / total) * 100) }
}

function round2(x: number): number {
  return Math.round(x * 100) / 100
}
