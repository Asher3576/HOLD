import { describe, expect, it } from 'vitest'
import { sanitizeAiText, violatesInvestmentSignal } from '../compliance'

/** 제품 불변식: AI는 절대 사라/팔라를 말하지 않는다 — 이 테스트가 그 계약이다. */
describe('violatesInvestmentSignal (지시어 금지)', () => {
  it('사실·조건문 브리핑은 허용', () => {
    const allowed = [
      '241.0 저항 3번째 테스트 중, 거래량은 감소. 이탈 시 다음 지지 228.4.',
      '손익비 1:2.3 — 벌 수 있는 폭이 잃을 수 있는 폭의 2.3배인 자리야.',
      'ADX 31로 추세 진행 중이다. 방향은 DI 우위와 일치.',
      '이 가격 아래로 내려가면 이 시나리오는 접어야 해요.',
      '당신의 과거 매도 12건 중 8건은 판 자리에서 30일 뒤 가격이 더 올랐어요.',
      '손절선에서 자동 회수됐어. 보험이 일한 거야.',
    ]
    for (const t of allowed) expect(violatesInvestmentSignal(t), t).toBe(false)
  })

  it('매매 지시는 차단', () => {
    const banned = [
      '지금 사세요',
      '이 가격이면 파세요',
      '풀매수 타이밍입니다',
      '무조건 매수하세요',
      '여기서 진입하세요',
      '손절하세요, 늦기 전에',
      '지금이 추격매수 자리예요',
      '이 종목은 사는 게 좋습니다',
      '매수 추천 드립니다',
      '팔아야 합니다',
      'Buy now before it moons',
      'This is a strong buy',
      'You should sell immediately',
    ]
    for (const t of banned) expect(violatesInvestmentSignal(t), t).toBe(true)
  })

  it('sanitizeAiText: 위반 문장은 고쳐 쓰지 않고 버린다(null)', () => {
    expect(sanitizeAiText('이탈 시 다음 지지 228.4.')).toBe('이탈 시 다음 지지 228.4.')
    expect(sanitizeAiText('지금 사세요')).toBeNull()
  })
})
