import { describe, expect, it } from 'vitest'
import { actualValue, ghostGap, ghostValue } from '../counterfactual'

describe('counterfactual (유령 계좌)', () => {
  // 삼성전자 예시: 100주 @70,000 매수 → 50주 @80,000 매도 → 현재가 90,000
  const initialQty = 100
  const sells = [{ quantity: 50, price: 80_000 }]
  const currentPrice = 90_000

  it('실제 가치 = 남은 주식 평가액 + 회수 현금', () => {
    // 50주 × 90,000 + 50주 × 80,000 = 8,500,000
    expect(actualValue(initialQty, sells, currentPrice)).toBe(8_500_000)
  })

  it('유령 가치 = 매도하지 않았다면의 평가액', () => {
    // 100주 × 90,000 = 9,000,000
    expect(ghostValue(initialQty, currentPrice)).toBe(9_000_000)
  })

  it('갭 = 유령 - 실제 (양수면 일찍 판 대가)', () => {
    expect(ghostGap(initialQty, sells, currentPrice)).toBe(500_000)
  })

  it('매도 후 가격이 내리면 갭이 음수 — "어기고 벌었다" 반례도 그대로 노출', () => {
    // 80,000에 판 뒤 60,000까지 하락: 매도가 이득이었다
    expect(ghostGap(initialQty, sells, 60_000)).toBe(-1_000_000)
  })

  it('매도가 없으면 실제 = 유령', () => {
    expect(actualValue(initialQty, [], currentPrice)).toBe(
      ghostValue(initialQty, currentPrice),
    )
  })
})
