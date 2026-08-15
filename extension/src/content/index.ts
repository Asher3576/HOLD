/**
 * HOLD 콘텐츠 스크립트 — 보고 있는 차트 위 오버레이 + 작도.
 *
 * - 작도: 수평선(클릭)·추세선(드래그) — 캘리브레이션 불필요, ESC/닫기로 종료
 * - 자동 레벨(지지/저항·계획선): 가격↔픽셀 2점 수동 보정 후 그리기 (Ext-1)
 *   ① 현재가 위치 클릭 → ② 다른 눈금 하나 클릭 + 가격 입력
 * - DOM 을 읽지 않는다. 화면 좌표만 다룬다. 차트를 스크롤/줌하면 다시 그어야 한다.
 */

interface LevelIn {
  price: number
  label: string
  kind: 'support' | 'resistance' | 'entry' | 'stop' | 'target'
}

type Drawing =
  | { type: 'h'; y: number }
  | { type: 't'; x1: number; y1: number; x2: number; y2: number }
  | { type: 'level'; y: number; price: number; label: string; kind: LevelIn['kind'] }

interface Calib {
  y1: number
  p1: number
  y2: number
  p2: number
}

const w = window as unknown as { __HOLD_CS__?: boolean }
if (!w.__HOLD_CS__) {
  w.__HOLD_CS__ = true

  const Z = '2147483640'
  const COLOR: Record<LevelIn['kind'], string> = {
    support: '#57C7A4',
    resistance: '#FF6B77',
    entry: '#F2F4F8',
    stop: '#FF6B77',
    target: '#57C7A4',
  }

  let canvas: HTMLCanvasElement | null = null
  let ctx: CanvasRenderingContext2D | null = null
  let toolbar: HTMLDivElement | null = null
  let toast: HTMLDivElement | null = null
  let mode: 'hline' | 'trend' | null = null
  let drawings: Drawing[] = []
  let calib: Calib | null = null
  let pendingLevels: { levels: LevelIn[]; currentPrice: number } | null = null
  let calibStep: 0 | 1 | 2 = 0
  let drag: { x1: number; y1: number; x2: number; y2: number } | null = null

  // ─── 캔버스 ────────────────────────────────────────────────────────────
  function ensureCanvas(): HTMLCanvasElement {
    if (canvas) return canvas
    canvas = document.createElement('canvas')
    Object.assign(canvas.style, {
      position: 'fixed',
      inset: '0',
      width: '100vw',
      height: '100vh',
      zIndex: Z,
      pointerEvents: 'none',
      cursor: 'crosshair',
    })
    document.documentElement.appendChild(canvas)
    resize()
    window.addEventListener('resize', () => {
      resize()
      redraw()
    })
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setMode(null)
    })
    return canvas
  }

  function resize() {
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(window.innerWidth * dpr)
    canvas.height = Math.round(window.innerHeight * dpr)
    ctx = canvas.getContext('2d')
    ctx?.scale(dpr, dpr)
  }

  function redraw() {
    if (!ctx || !canvas) return
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    for (const d of drawings) {
      if (d.type === 'h') {
        line(0, d.y, window.innerWidth, d.y, '#F5B23E', 2, [])
        tag(`${Math.round(d.y)}`, window.innerWidth - 8, d.y, '#F5B23E', true)
      } else if (d.type === 't') {
        line(d.x1, d.y1, d.x2, d.y2, '#F5B23E', 2, [])
      } else {
        const dash = d.kind === 'entry' ? [] : [7, 5]
        line(0, d.y, window.innerWidth, d.y, COLOR[d.kind], 1.8, dash)
        tag(d.label, window.innerWidth - 8, d.y, COLOR[d.kind], true)
      }
    }
    if (drag) line(drag.x1, drag.y1, drag.x2, drag.y2, 'rgba(245,178,62,0.7)', 2, [4, 4])
  }

  function line(x1: number, y1: number, x2: number, y2: number, color: string, width: number, dash: number[]) {
    if (!ctx) return
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.setLineDash(dash)
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  function tag(text: string, x: number, y: number, color: string, alignRight: boolean) {
    if (!ctx) return
    ctx.font = '600 11px ui-monospace, Menlo, monospace'
    const tw = ctx.measureText(text).width
    const bx = alignRight ? x - tw - 10 : x
    ctx.fillStyle = 'rgba(11,14,20,0.85)'
    ctx.fillRect(bx, y - 17, tw + 10, 16)
    ctx.fillStyle = color
    ctx.fillText(text, bx + 5, y - 5)
  }

  // ─── 툴바 / 토스트 ─────────────────────────────────────────────────────
  function ensureToolbar() {
    if (toolbar) return
    toolbar = document.createElement('div')
    Object.assign(toolbar.style, {
      position: 'fixed',
      top: '12px',
      right: '12px',
      zIndex: String(Number(Z) + 2),
      display: 'flex',
      gap: '6px',
      padding: '6px',
      borderRadius: '12px',
      background: 'rgba(17,20,28,0.92)',
      border: '1px solid rgba(255,255,255,0.15)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      fontFamily: "-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif",
    })
    const mk = (label: string, onClick: () => void) => {
      const b = document.createElement('button')
      b.textContent = label
      Object.assign(b.style, {
        font: '600 11px inherit',
        color: '#F2F4F8',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: '8px',
        padding: '6px 9px',
        cursor: 'pointer',
      })
      b.addEventListener('click', onClick)
      toolbar!.appendChild(b)
      return b
    }
    mk('─ 수평선', () => setMode(mode === 'hline' ? null : 'hline'))
    mk('╱ 추세선', () => setMode(mode === 'trend' ? null : 'trend'))
    mk('지우기', () => {
      drawings = []
      calib = null
      redraw()
    })
    mk('✕', () => {
      setMode(null)
      toolbar?.remove()
      toolbar = null
    })
    document.documentElement.appendChild(toolbar)
  }

  function showToast(msg: string, sticky = false) {
    if (!toast) {
      toast = document.createElement('div')
      Object.assign(toast.style, {
        position: 'fixed',
        left: '50%',
        top: '16px',
        transform: 'translateX(-50%)',
        zIndex: String(Number(Z) + 2),
        background: 'rgba(17,20,28,0.94)',
        border: '1px solid rgba(255,255,255,0.18)',
        color: '#F2F4F8',
        font: "600 12.5px -apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif",
        padding: '10px 16px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        maxWidth: '80vw',
      })
      document.documentElement.appendChild(toast)
    }
    toast.textContent = msg
    toast.style.display = 'block'
    if (!sticky) setTimeout(() => toast && (toast.style.display = 'none'), 3200)
  }

  function setMode(m: typeof mode) {
    mode = m
    ensureCanvas().style.pointerEvents = m || calibStep ? 'auto' : 'none'
    ensureToolbar()
    if (m === 'hline') showToast('수평선 모드 — 원하는 위치를 클릭 (ESC 종료)', true)
    else if (m === 'trend') showToast('추세선 모드 — 드래그해서 긋기 (ESC 종료)', true)
    else if (toast) toast.style.display = 'none'
  }

  // ─── 캘리브레이션 (2점) ────────────────────────────────────────────────
  function startCalibration(currentPrice: number) {
    calibStep = 1
    ensureCanvas().style.pointerEvents = 'auto'
    showToast(`① 차트에서 현재가(${fmt(currentPrice)}) 위치를 클릭해줘`, true)
  }

  function askSecondPrice(y: number) {
    const box = document.createElement('div')
    Object.assign(box.style, {
      position: 'fixed',
      left: '50%',
      top: '52px',
      transform: 'translateX(-50%)',
      zIndex: String(Number(Z) + 3),
      background: 'rgba(17,20,28,0.96)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '12px',
      padding: '12px 14px',
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
      font: "600 12px -apple-system,'Apple SD Gothic Neo',sans-serif",
      color: '#F2F4F8',
    })
    box.append('클릭한 눈금의 가격:')
    const input = document.createElement('input')
    Object.assign(input.style, {
      width: '110px',
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '8px',
      color: '#F2F4F8',
      padding: '7px 9px',
      font: 'inherit',
    })
    input.type = 'number'
    input.placeholder = '예: 240'
    const ok = document.createElement('button')
    ok.textContent = '확인'
    Object.assign(ok.style, {
      background: 'linear-gradient(180deg,#FF5A66,#E93D4C)',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      padding: '7px 12px',
      font: 'inherit',
      cursor: 'pointer',
    })
    const done = () => {
      const p2 = Number(input.value)
      box.remove()
      if (!Number.isFinite(p2) || p2 <= 0 || !calib || p2 === calib.p1) {
        calibStep = 0
        showToast('보정 취소 — 다시 시도해줘')
        return
      }
      calib.y2 = pendingY2
      calib.p2 = p2
      calibStep = 0
      ensureCanvas().style.pointerEvents = mode ? 'auto' : 'none'
      if (toast) toast.style.display = 'none'
      if (pendingLevels) {
        renderLevels(pendingLevels.levels)
        pendingLevels = null
      }
    }
    ok.addEventListener('click', done)
    input.addEventListener('keydown', (e) => e.key === 'Enter' && done())
    box.append(input, ok)
    document.documentElement.appendChild(box)
    input.focus()
    pendingY2 = y
  }
  let pendingY2 = 0

  function priceToY(price: number): number | null {
    if (!calib || calib.p2 === calib.p1) return null
    return calib.y1 + ((price - calib.p1) * (calib.y2 - calib.y1)) / (calib.p2 - calib.p1)
  }

  function renderLevels(levels: LevelIn[]) {
    drawings = drawings.filter((d) => d.type !== 'level')
    for (const l of levels) {
      const y = priceToY(l.price)
      if (y == null || y < 0 || y > window.innerHeight) continue
      drawings.push({ type: 'level', y, price: l.price, label: l.label, kind: l.kind })
    }
    redraw()
    showToast('레벨을 그었어 — 차트를 움직였다면 다시 그어줘')
  }

  function fmt(n: number): string {
    return n >= 1000 ? Math.round(n).toLocaleString('ko-KR') : String(Math.round(n * 100) / 100)
  }

  // ─── 포인터 ────────────────────────────────────────────────────────────
  function onDown(e: PointerEvent) {
    if (calibStep === 1) {
      calib = { y1: e.clientY, p1: pendingP1, y2: 0, p2: 0 }
      calibStep = 2
      showToast('② Y축 눈금 하나를 클릭한 뒤, 그 가격을 입력해줘', true)
      return
    }
    if (calibStep === 2) {
      askSecondPrice(e.clientY)
      return
    }
    if (mode === 'hline') {
      drawings.push({ type: 'h', y: e.clientY })
      redraw()
    } else if (mode === 'trend') {
      drag = { x1: e.clientX, y1: e.clientY, x2: e.clientX, y2: e.clientY }
    }
  }
  let pendingP1 = 0

  function onMove(e: PointerEvent) {
    if (drag) {
      drag.x2 = e.clientX
      drag.y2 = e.clientY
      redraw()
    }
  }

  function onUp() {
    if (drag) {
      drawings.push({ type: 't', ...drag })
      drag = null
      redraw()
    }
  }

  // ─── 메시지 ────────────────────────────────────────────────────────────
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    ensureCanvas()
    ensureToolbar()
    if (msg?.type === 'HOLD_PING') {
      sendResponse({ ok: true })
    } else if (msg?.type === 'HOLD_SET_MODE') {
      setMode(msg.mode ?? null)
      sendResponse({ ok: true })
    } else if (msg?.type === 'HOLD_CLEAR') {
      drawings = []
      calib = null
      redraw()
      sendResponse({ ok: true })
    } else if (msg?.type === 'HOLD_DRAW_LEVELS') {
      const { levels, currentPrice } = msg as { levels: LevelIn[]; currentPrice: number }
      if (!calib) {
        pendingLevels = { levels, currentPrice }
        pendingP1 = currentPrice
        startCalibration(currentPrice)
      } else {
        renderLevels(levels)
      }
      sendResponse({ ok: true })
    }
    return undefined
  })
}
