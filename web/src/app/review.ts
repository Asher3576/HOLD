/** 복기 3턴 결과 → 카드 칩/마무리 문장 */
export function reviewTags(rvA1: string | null, rvA2: string | null) {
  const trigMap: Record<string, string> = {
    '뉴스가 불안해서': '뉴스 불안',
    '숫자가 무서워서': '숫자 공포',
    '이유가 무너져서': '논지 붕괴',
  }
  const rvTrigger = trigMap[rvA1 ?? ''] || '숫자 공포'
  const rvThesis = rvA2 === '있었다' ? '변화' : '유효'
  const rvEmotion = rvA1 === '이유가 무너져서' ? '동요' : '불안'
  const canonical = rvA1 === '숫자가 무서워서' && rvA2 === '없었다'
  const rvFinal = canonical
    ? '적어둘게 — 이유는 멀쩡했고, 숫자가 방아쇠였어. 네 조기 매도 8번 중 7번이 같은 패턴이야'
    : '적어둘게.'
  return { rvTrigger, rvThesis, rvEmotion, rvFinal }
}
