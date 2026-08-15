import { describe, expect, it } from 'vitest'
import { hitRate, rrRatio } from '../rr'

describe('rrRatio (손익비)', () => {
  it('상승 계획: 진입 100, 손절 95, 목표 111.5 → 1:2.3', () => {
    const r = rrRatio({
      direction: 'up',
      entryPrice: 100,
      stopPrice: 95,
      targetPrice: 111.5,
    })
    expect(r.rewardPct).toBeCloseTo(11.5)
    expect(r.riskPct).toBeCloseTo(5)
    expect(r.ratio).toBeCloseTo(2.3)
  })

  it('하락 계획(숏 관점)도 방향 기준으로 보상/위험 계산', () => {
    const r = rrRatio({
      direction: 'down',
      entryPrice: 100,
      stopPrice: 104,
      targetPrice: 92,
    })
    expect(r.rewardPct).toBeCloseTo(8)
    expect(r.riskPct).toBeCloseTo(4)
    expect(r.ratio).toBeCloseTo(2)
  })

  it('손절이 진입보다 유리한 쪽이면 ratio null (입력 오류 방어)', () => {
    const r = rrRatio({
      direction: 'up',
      entryPrice: 100,
      stopPrice: 105, // 상승 계획인데 손절이 진입 위
      targetPrice: 110,
    })
    expect(r.ratio).toBeNull()
  })
})

describe('hitRate (적중률)', () => {
  it('12건 중 4건 적중 → 33%', () => {
    const outcomes = [
      ...Array<'hit'>(4).fill('hit'),
      ...Array<'miss'>(8).fill('miss'),
    ]
    expect(hitRate(outcomes)).toEqual({ total: 12, hits: 4, pct: 33 })
  })

  it('표본 없으면 pct null — 0%로 오해하게 만들지 않는다', () => {
    expect(hitRate([]).pct).toBeNull()
  })
})
