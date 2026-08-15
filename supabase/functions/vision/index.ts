// HOLD 비전 엣지 함수 (Ext-2 스켈레톤)
// 역할: 확장이 보낸 차트 스크린샷에서 "캘리브레이션 정보"만 추출한다.
//   - Y축 가격 라벨들과 그 픽셀 좌표 → 가격↔픽셀 선형 매핑 (라벨 3개 이상으로 로그스케일 감지)
//   - 심볼 후보 텍스트 (URL 파싱 실패 시 폴백)
// 원칙:
//   - 스크린샷 원본은 처리 후 즉시 폐기 — 저장/로깅 금지 (계좌 잔고 등이 찍혀 있을 수 있다)
//   - 레벨 계산은 여기서 하지 않는다 — ta 함수가 자체 캔들 데이터로 결정적으로 계산
//   - 비전 모델 프롬프트에 "차트 축 라벨 외 개인정보는 무시·미출력" 명시

Deno.serve(async (req) => {
  const url = new URL(req.url)

  if (req.method === 'GET' && url.pathname.endsWith('/health')) {
    return Response.json({ ok: true, service: 'hold-vision' })
  }

  return Response.json({ error: 'not implemented (Ext-2)' }, { status: 501 })
})
