/**
 * 팝업 (스켈레톤) — "홀디 부르기" 버튼.
 * 클릭 시에만 activeTab 권한이 살아나 해당 탭에 콘텐츠 스크립트를 주입한다.
 * 상시 주입 없음 = 프라이버시·웹스토어 심사 모두 유리.
 */

document.getElementById('summon')?.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id) return
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js'],
  })
  await chrome.tabs.sendMessage(tab.id, { type: 'HOLD_DEMO_OVERLAY' })
  window.close()
})
