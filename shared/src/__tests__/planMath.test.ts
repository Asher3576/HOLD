import { describe, expect, it } from 'vitest'
import {
  planDriftIndex,
  priceProgress,
  shouldBlur,
  stopPrice,
  takePrice,
  timeProgress,
} from '../planMath'

const basePlan = {
  entryPrice: 70_000,
  stopPct: 8, // -8% → 64,400
  takePct: 20, // +20% → 84,000
}

describe('planMath (계획 진행률)', () => {
  it('손절가/익절가 계산', () => {
    expect(stopPrice(basePlan)).toBeCloseTo(64_400)
    expect(takePrice(basePlan)).toBeCloseTo(84_000)
  })

  it('가격 진행률: 손절가=0, 익절가=1 사이 위치', () => {
    // (78,000 - 64,400) / (84,000 - 64,400) ≈ 0.694
    expect(priceProgress(basePlan, 78_000)).toBeCloseTo(0.6938, 3)
  })

  it('구간 밖은 0~1로 클램프', () => {
    expect(priceProgress(basePlan, 60_000)).toBe(0)
    expect(priceProgress(basePlan, 100_000)).toBe(1)
  })

  it('기간 진행률', () => {
    const plan = { createdAt: '2026-08-01T00:00:00Z', horizonDays: 30 }
    const now = new Date('2026-08-16T00:00:00Z') // 15일 경과
    expect(timeProgress(plan, now)).toBeCloseTo(0.5)
  })

  it('목표 근접 블러: 80% 이상에서 흐림', () => {
    expect(shouldBlur(0.79)).toBe(false)
    expect(shouldBlur(0.8)).toBe(true)
    expect(shouldBlur(0.95)).toBe(true)
  })
})

describe('planDriftIndex (계획 이완 지수)', () => {
  const origin = {
    originStopPct: 8,
    originTakePct: 20,
    originHorizonDays: 30,
  }

  it('원안 그대로면 0', () => {
    expect(
      planDriftIndex({ ...origin, stopPct: 8, takePct: 20, horizonDays: 30 }),
    ).toBe(0)
  })

  it('손절선을 낮추면(더 버티기) 지수 상승', () => {
    // 손절 8→12 (+50%), 나머지 그대로 → (0.5 + 0 + 0) / 3
    expect(
      planDriftIndex({ ...origin, stopPct: 12, takePct: 20, horizonDays: 30 }),
    ).toBeCloseTo(0.1667, 3)
  })

  it('원안보다 조이는 방향(손절 좁힘)은 이완으로 치지 않음', () => {
    expect(
      planDriftIndex({ ...origin, stopPct: 5, takePct: 20, horizonDays: 30 }),
    ).toBe(0)
  })

  it('전부 크게 풀면 1로 캡', () => {
    expect(
      planDriftIndex({
        ...origin,
        stopPct: 40,
        takePct: 100,
        horizonDays: 365,
      }),
    ).toBe(1)
  })
})
