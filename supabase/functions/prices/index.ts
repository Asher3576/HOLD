// HOLD 시세 엣지 함수 (Phase C 스켈레톤)
// 역할: 일봉 종가 수집 → prices_daily 저장, 열매 채점(outcome_pct), 유령 곡선 데이터
// 지연 시세 사용(재배포 라이선스 리스크 회피). 실시간 호가 불필요 — HOLD는 트레이딩 앱이 아님.

Deno.serve(async (req) => {
  const url = new URL(req.url)

  if (req.method === 'GET' && url.pathname.endsWith('/health')) {
    return Response.json({ ok: true, service: 'hold-prices' })
  }

  return Response.json({ error: 'not implemented (Phase C)' }, { status: 501 })
})
