import type { Plan } from './types'

/** 손절 가격 (원) */
export function stopPrice(plan: Pick<Plan, 'entryPrice' | 'stopPct'>): number {
  return plan.entryPrice * (1 - plan.stopPct / 100)
}

/** 익절 가격 (원) */
export function takePrice(plan: Pick<Plan, 'entryPrice' | 'takePct'>): number {
  return plan.entryPrice * (1 + plan.takePct / 100)
}

/**
 * 가격 진행률 0~1.
 * 손절가를 0, 익절가를 1로 놓고 현재가가 구간 내 어디에 있는지.
 * 수익률을 보여주지 않기 위한 HOLD의 핵심 지표.
 */
export function priceProgress(
  plan: Pick<Plan, 'entryPrice' | 'stopPct' | 'takePct'>,
  currentPrice: number,
): number {
  const lo = stopPrice(plan)
  const hi = takePrice(plan)
  if (hi <= lo) return 0
  const raw = (currentPrice - lo) / (hi - lo)
  return Math.min(1, Math.max(0, raw))
}

/** 기간 진행률 0~1 */
export function timeProgress(
  plan: Pick<Plan, 'createdAt' | 'horizonDays'>,
  now: Date,
): number {
  const started = new Date(plan.createdAt).getTime()
  const elapsedDays = (now.getTime() - started) / 86_400_000
  if (plan.horizonDays <= 0) return 1
  return Math.min(1, Math.max(0, elapsedDays / plan.horizonDays))
}

/**
 * 목표 근접 블러 (goal-gradient 방어):
 * 익절선 근처(기본 80% 이상)에서는 진행률을 흐리게 보여줘
 * "거의 다 왔으니 지금 팔자" 충동을 줄인다.
 */
export const BLUR_THRESHOLD = 0.8

export function shouldBlur(progress: number): boolean {
  return progress >= BLUR_THRESHOLD
}

/**
 * 계획 이완 지수 0~1.
 * 원안 대비 손절선을 낮추거나(더 버티기), 익절선을 올리거나, 기간을 늘린 정도.
 * 0 = 원안 그대로, 1에 가까울수록 계획이 크게 풀어짐(게이밍 신호).
 */
export function planDriftIndex(
  plan: Pick<
    Plan,
    | 'stopPct'
    | 'takePct'
    | 'horizonDays'
    | 'originStopPct'
    | 'originTakePct'
    | 'originHorizonDays'
  >,
): number {
  const stopDrift =
    plan.originStopPct > 0
      ? Math.max(0, plan.stopPct - plan.originStopPct) / plan.originStopPct
      : 0
  const takeDrift =
    plan.originTakePct > 0
      ? Math.max(0, plan.takePct - plan.originTakePct) / plan.originTakePct
      : 0
  const horizonDrift =
    plan.originHorizonDays > 0
      ? Math.max(0, plan.horizonDays - plan.originHorizonDays) /
        plan.originHorizonDays
      : 0
  const raw = (stopDrift + takeDrift + horizonDrift) / 3
  return Math.min(1, raw)
}
