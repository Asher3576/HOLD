// HOLD AI 엣지 함수 (스켈레톤)
// 역할: LLM 은 "문장만" 쓴다 — 수치는 전부 ta 함수의 결정적 계산 결과를 인용 (환각 방지).
//   - 브리핑 코멘트: analyses.facts → 한 문단 브리핑 (확장 팝업/오버레이 라벨)
//   - 말하는 복기: 계획 종료 후 질문만 하는 대화 (Phase C)
// 규칙: 절대 "사라/팔라"를 출력하지 않는다 — 사실·조건문만.
//   (StockersClub pretrade_coach 의 프롬프트 정책 + violatesInvestmentSignal 필터 포팅 대상)
// StockersClub의 단일 12,000줄 index.tsx 반면교사 — 기능별 파일 분리 유지.

Deno.serve(async (req) => {
  const url = new URL(req.url)

  if (req.method === 'GET' && url.pathname.endsWith('/health')) {
    return Response.json({ ok: true, service: 'hold-ai' })
  }

  return Response.json({ error: 'not implemented' }, { status: 501 })
})
