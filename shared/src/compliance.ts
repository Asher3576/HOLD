/**
 * AI 출력 컴플라이언스 필터 — 제품 불변식 6-3 "AI는 절대 사라/팔라를 말하지 않는다"의
 * 코드 구현. (자본시장법 투자자문 정의: 종목·수량·가격·시기에 대한 조언)
 *
 * 하네스 규칙: 확장 브리핑·손익비 코치·복기 등 LLM 이 생성한 문장은
 * 사용자에게 보여지기 전에 반드시 이 필터를 통과해야 한다.
 * 서버(ai 엣지 함수)에서 최종 적용하고, 문구 정책이 바뀌면
 * 여기 패턴과 __tests__/compliance.test.ts 를 함께 고친다.
 */

/** 매매 지시로 읽히는 표현들 — 사실·조건문("이탈 시 다음 지지 X")은 허용 */
const BANNED_PATTERNS: RegExp[] = [
  // 직접 지시 (한국어)
  /사세요|파세요|사라\b|팔라\b|사라고|팔라고/,
  /매수하세요|매도하세요|매수해라|매도해라|매수하라|매도하라/,
  /진입하세요|진입해라|진입하라|들어가세요|들어가라/,
  /(손절|익절)하세요/,
  /(지금|당장|무조건).{0,6}(사|팔|매수|매도|진입)/,
  /풀매수|풀매도|올인/, // 그 자체로 지시성 — 단독으로도 차단
  /추격\s?매수|물타기\s?하세요/,
  // 강한 권유
  /사는\s?게\s?좋|파는\s?게\s?좋|매수(를)?\s?추천|매도(를)?\s?추천|추천\s?종목/,
  /사야\s?(해|합니다|한다)|팔아야\s?(해|합니다|한다)/,
  // 영어
  /\b(buy|sell)\s+(it\s+)?now\b/i,
  /\bstrong\s+(buy|sell)\b/i,
  /\byou\s+should\s+(buy|sell)\b/i,
]

/** true 면 투자자문(매매 지시)으로 읽히는 문장 — 노출 금지 */
export function violatesInvestmentSignal(text: string): boolean {
  const t = text.trim()
  if (!t) return false
  return BANNED_PATTERNS.some((re) => re.test(t))
}

/**
 * LLM 출력 새니타이즈: 위반 시 null 을 반환해 호출부가 해당 문장을 버리게 한다.
 * (문장을 고쳐 쓰지 않는다 — 고쳐 쓰면 필터가 작문가가 되어버린다)
 */
export function sanitizeAiText(text: string): string | null {
  return violatesInvestmentSignal(text) ? null : text
}
