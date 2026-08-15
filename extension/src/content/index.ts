/**
 * 콘텐츠 스크립트 (스켈레톤) — 남의 차트 위에 우리 레이어를 얹는다.
 *
 * - 오버레이: position:fixed + pointer-events:none 투명 레이어에 지지/저항 선.
 *   드래그 핸들(진입/손절/목표)만 pointer-events 활성.
 * - 가격↔픽셀 매핑: Ext-1은 수동 보정(기준선 2개 드래그), Ext-2는 비전 캘리브레이션.
 * - 심볼 인식 1순위는 URL/타이틀 파싱(사이트 어댑터), 비전은 폴백.
 * - 페이지 DOM 은 읽지 않는다(캔버스 차트라 어차피 못 읽음) — 화면 좌표만 다룬다.
 */

const ROOT_ID = 'hold-overlay-root'

function ensureOverlayRoot(): HTMLDivElement {
  let root = document.getElementById(ROOT_ID) as HTMLDivElement | null
  if (root) return root
  root = document.createElement('div')
  root.id = ROOT_ID
  Object.assign(root.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '2147483646',
    pointerEvents: 'none',
  })
  document.documentElement.appendChild(root)
  return root
}

/** 데모: 화면 중앙에 홀디의 저항선 하나를 그어본다 (Ext-1에서 실데이터로 대체) */
function drawDemoLine() {
  const root = ensureOverlayRoot()
  root.innerHTML = ''
  const line = document.createElement('div')
  Object.assign(line.style, {
    position: 'absolute',
    left: '0',
    right: '0',
    top: '40%',
    borderTop: '2px dashed #1F5F5B',
  })
  const label = document.createElement('span')
  label.textContent = '홀디: 여기가 저항이에요 (데모)'
  Object.assign(label.style, {
    position: 'absolute',
    right: '8px',
    top: '-22px',
    background: '#1F5F5B',
    color: '#FAF8F3',
    fontSize: '12px',
    padding: '2px 8px',
    borderRadius: '6px',
  })
  line.appendChild(label)
  root.appendChild(line)
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === 'HOLD_DEMO_OVERLAY') drawDemoLine()
})
