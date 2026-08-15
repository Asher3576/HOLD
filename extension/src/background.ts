/**
 * 백그라운드 서비스 워커 (스켈레톤).
 *
 * 역할 (Ext 단계별):
 * - Ext-1: 심볼 인식(URL/타이틀 파싱) → 서버 ta 함수에서 레벨/브리핑 수신
 * - Ext-2: activeTab 캡처(captureVisibleTab) → vision 함수로 축 캘리브레이션
 * - 인증: Supabase 세션 토큰을 chrome.storage 에 보관, API 호출에 첨부
 *
 * 프라이버시 원칙: 스크린샷은 캘리브레이션 처리 후 즉시 폐기, 서버에 저장하지 않는다.
 * 상시 주입 없음 — 사용자가 홀디를 부른(popup 클릭) 탭에서만 동작(activeTab).
 */

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'HOLD_CAPTURE') {
    // activeTab 권한은 popup 클릭 시점에 부여됨 → 그 탭만 캡처 가능
    chrome.tabs.captureVisibleTab({ format: 'png' }, (dataUrl) => {
      // TODO(Ext-2): dataUrl → supabase/functions/vision 으로 전송해
      // Y축 라벨(가격, 픽셀) + 심볼 후보 추출 → content 로 전달
      sendResponse({ ok: true, bytes: dataUrl?.length ?? 0 })
    })
    return true // async sendResponse
  }
  return undefined
})
