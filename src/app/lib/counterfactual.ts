/**
 * 반사실(유령) 계좌 계산.
 * "그때 팔지 않았다면 지금 얼마였을까"를 매도 기록만 제거해 계산한다.
 *
 * 예) 100주를 70,000원에 매수, 50주를 80,000원에 매도, 현재가 90,000원:
 *   실제 = 남은 50주 × 90,000 + 회수현금 50주 × 80,000 = 8,500,000
 *   유령 = 매도가 없었다면 100주 × 90,000 = 9,000,000
 *   갭   = 유령 - 실제 = +500,000 (일찍 판 대가)
 */

export interface SellEvent {
  quantity: number
  price: number
}

/** 실제 가치 = 남은 주식 × 현재가 + 매도로 회수한 현금 */
export function actualValue(
  initialQty: number,
  sells: SellEvent[],
  currentPrice: number,
): number {
  const soldQty = sells.reduce((sum, s) => sum + s.quantity, 0)
  const cash = sells.reduce((sum, s) => sum + s.quantity * s.price, 0)
  return (initialQty - soldQty) * currentPrice + cash
}

/** 유령 가치 = 매도를 하나도 하지 않았다면의 평가액 */
export function ghostValue(initialQty: number, currentPrice: number): number {
  return initialQty * currentPrice
}

/**
 * 유령 - 실제.
 * 양수면 매도가 손해였고(더 들고 있었어야), 음수면 매도가 이득이었다.
 * "어기고 벌었다" 반례도 그대로 노출하기 위해 부호를 감추지 않는다.
 */
export function ghostGap(
  initialQty: number,
  sells: SellEvent[],
  currentPrice: number,
): number {
  return (
    ghostValue(initialQty, currentPrice) -
    actualValue(initialQty, sells, currentPrice)
  )
}
