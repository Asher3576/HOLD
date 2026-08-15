/**
 * 백그라운드 서비스 워커.
 * 툴바 아이콘 클릭 → 사이드 패널 오픈 (+ 그 순간 activeTab 권한 부여 → 콘텐츠 스크립트 주입 가능).
 * 상시 주입 없음 — 사용자가 부른 탭에서만 동작한다.
 */
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((e) => console.warn('[HOLD] sidePanel behavior', e))
