// HOLD 시세 엣지 함수 (스켈레톤)
// 역할: OHLCV 캔들 수집 → candles 저장, 채점 크론(열매 outcome_pct, calls 적중 확정)
// 소스: 미국주식 Tiingo 일봉(지연시세 — 재배포 라이선스 리스크 회피).
//   확장 라이브 코멘트(Ext-3)에서만 60m/15m 추가 검토.
// 실시간 호가 불필요 — HOLD 는 트레이딩 앱이 아니라 결정 레이어다.

Deno.serve(async (req) => {
  const url = new URL(req.url)

  if (req.method === 'GET' && url.pathname.endsWith('/health')) {
    return Response.json({ ok: true, service: 'hold-prices' })
  }

  return Response.json({ error: 'not implemented (Phase C)' }, { status: 501 })
})
