// HOLD AI 엣지 함수 (Phase C 스켈레톤)
// 역할: 논지 레이더(계획 이유 관련 뉴스 상태), 말하는 복기(질문만 하는 대화)
// 규칙: 절대 "사라/팔라"를 출력하지 않는다 — 수량·가격·시기 조언 금지.
// StockersClub의 단일 12,000줄 index.tsx 반면교사 — 기능별 파일 분리 유지.

Deno.serve(async (req) => {
  const url = new URL(req.url)

  if (req.method === 'GET' && url.pathname.endsWith('/health')) {
    return Response.json({ ok: true, service: 'hold-ai' })
  }

  return Response.json({ error: 'not implemented (Phase C)' }, { status: 501 })
})
