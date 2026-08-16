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

const w = window as unknown as { __HOLD_CS__?: string | boolean }
const HOLD_CS_VER = '0.4.2'
if (w.__HOLD_CS__ !== HOLD_CS_VER) {
  // 확장 업데이트 후 남아있는 이전 버전 오버레이 제거 (우리 UI 는 전부 <html> 직속 + 고유 z-index)
  for (const el of Array.from(document.documentElement.children)) {
    const z = (el as HTMLElement).style?.zIndex ?? ''
    if (/^214748364\d$/.test(z)) el.remove()
  }
  w.__HOLD_CS__ = HOLD_CS_VER

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
  let mode: 'hline' | 'trend' | 'region' | null = null
  let drawings: Drawing[] = []
  let calib: Calib | null = null
  let pendingLevels: { levels: LevelIn[]; currentPrice: number } | null = null
  let calibStep: 0 | 1 | 2 = 0
  let drag: { x1: number; y1: number; x2: number; y2: number } | null = null

  /** 작도 대상 차트 영역 — 선·라벨이 이 사각형 안에만 그려진다 */
  interface Rect {
    x: number
    y: number
    w: number
    h: number
  }
  let region: Rect | null = null

  /** 페이지에서 가장 큰 캔버스/iframe(트레이딩뷰 임베드)을 차트 영역으로 추정 */
  function autoDetectRegion() {
    let best: Rect | null = null
    let bestArea = 0
    const consider = (r: { left: number; top: number; width: number; height: number; bottom: number }, ox = 0, oy = 0) => {
      if (r.width < 300 || r.height < 180) return
      if (r.bottom + oy < 0 || r.top + oy > window.innerHeight) return
      const area = r.width * r.height
      if (area > bestArea) {
        bestArea = area
        best = { x: r.left + ox, y: r.top + oy, w: r.width, h: r.height }
      }
    }
    for (const el of Array.from(document.querySelectorAll('canvas, iframe'))) {
      consider((el as HTMLElement).getBoundingClientRect())
      // 같은 출처 iframe 이면 내부의 실제 차트 캔버스를 더 정밀하게 잡는다
      if (el.tagName === 'IFRAME') {
        try {
          const d = (el as HTMLIFrameElement).contentDocument
          if (d) {
            const fr = (el as HTMLElement).getBoundingClientRect()
            for (const c of Array.from(d.querySelectorAll('canvas'))) {
              consider(c.getBoundingClientRect(), fr.left, fr.top)
            }
          }
        } catch {
          /* cross-origin 제외 */
        }
      }
    }
    if (best) region = best
  }

  const chartRect = (): Rect => region ?? { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight }

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
    const R = chartRect()

    // 영역 지정/작도 중엔 대상 영역을 은은하게 표시
    if (region && (mode || calibStep)) {
      ctx.strokeStyle = 'rgba(245,178,62,0.35)'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      ctx.strokeRect(R.x, R.y, R.w, R.h)
    }

    ctx.save()
    ctx.beginPath()
    ctx.rect(R.x, R.y, R.w, R.h)
    ctx.clip()
    for (const d of drawings) {
      if (d.type === 'h') {
        line(R.x, d.y, R.x + R.w, d.y, '#F5B23E', 2, [])
      } else if (d.type === 't') {
        line(d.x1, d.y1, d.x2, d.y2, '#F5B23E', 2, [])
      } else {
        const dash = d.kind === 'entry' ? [] : [7, 5]
        line(R.x, d.y, R.x + R.w, d.y, COLOR[d.kind], 1.8, dash)
      }
    }
    ctx.restore()
    // 라벨은 클립 밖에서 (영역 우측 끝 기준).
    // 수평선은 가격 보정이 돼 있을 때만 가격 라벨 — 픽셀 좌표는 표시하지 않는다.
    for (const d of drawings) {
      if (d.type === 'level') {
        tag(d.label, R.x + R.w - 8, d.y, COLOR[d.kind], true)
      } else if (d.type === 'h') {
        const p = yToPrice(d.y)
        if (p != null) tag(fmt(p), R.x + R.w - 8, d.y, '#F5B23E', true)
      }
    }

    if (drag) {
      if (mode === 'region') {
        ctx.strokeStyle = 'rgba(245,178,62,0.8)'
        ctx.lineWidth = 1.5
        ctx.setLineDash([6, 4])
        ctx.strokeRect(Math.min(drag.x1, drag.x2), Math.min(drag.y1, drag.y2), Math.abs(drag.x2 - drag.x1), Math.abs(drag.y2 - drag.y1))
      } else {
        line(drag.x1, drag.y1, drag.x2, drag.y2, 'rgba(245,178,62,0.7)', 2, [4, 4])
      }
    }
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
    mk('▣ 영역', () => setMode(mode === 'region' ? null : 'region'))
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
    if ((m === 'hline' || m === 'trend') && !region) autoDetectRegion()
    ensureCanvas().style.pointerEvents = m || calibStep ? 'auto' : 'none'
    ensureToolbar()
    if (m === 'hline') showToast('수평선 모드 — 차트 위 원하는 위치를 클릭 (ESC 종료)', true)
    else if (m === 'trend') showToast('추세선 모드 — 드래그해서 긋기 (ESC 종료)', true)
    else if (m === 'region') showToast('차트 영역 지정 — 차트를 감싸게 드래그해줘', true)
    else if (toast) toast.style.display = 'none'
    redraw()
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

  /**
   * 차트 축 눈금 자동 인식 — 화면의 가격 눈금 텍스트(DOM)를 찾아 클릭 없이 보정한다.
   * 차트 영역(region) 좌/우 가장자리의 숫자들 중, 아래로 갈수록 가격이 일정하게
   * 감소하는(=진짜 Y축) 줄만 골라 선형 매핑을 만든다. 눈금이 캔버스에 그려진
   * 사이트(텍스트 없음)면 실패하고 기존 수동 2점 보정으로 넘어간다.
   */
  function autoCalibrateFromAxis(currentPrice: number): boolean {
    if (!region) return false // 차트 영역을 못 찾았으면 오탐(호가창 등) 위험 — 시도 안 함
    const R = region
    interface Pt {
      y: number
      p: number
    }
    const right: Pt[] = []
    const left: Pt[] = []
    // 눈금 텍스트를 찾을 문서들 — 최상위 + 같은 출처 iframe (차트를 iframe 에 넣는 사이트 대응).
    // iframe 내부 좌표는 iframe 의 화면 위치만큼 보정한다.
    const docs: { body: HTMLElement; ox: number; oy: number }[] = []
    if (document.body) docs.push({ body: document.body, ox: 0, oy: 0 })
    try {
      for (const f of Array.from(document.querySelectorAll('iframe')).slice(0, 10)) {
        try {
          const d = (f as HTMLIFrameElement).contentDocument
          if (d?.body) {
            const fr = f.getBoundingClientRect()
            docs.push({ body: d.body, ox: fr.left, oy: fr.top })
          }
        } catch {
          /* cross-origin 프레임 제외 */
        }
      }
    } catch {
      /* 무시 */
    }
    try {
      for (const { body, ox, oy } of docs) {
        const walker = (body.ownerDocument ?? document).createTreeWalker(body, NodeFilter.SHOW_TEXT)
        let node: Node | null
        let seen = 0
        while ((node = walker.nextNode()) && seen < 4000) {
          seen++
          const s = (node.nodeValue ?? '').trim()
          if (!/^[\d,]+(?:\.\d+)?$/.test(s)) continue
          const p = Number(s.replace(/,/g, ''))
          if (!(p > 0)) continue
          const el = node.parentElement
          if (!el) continue
          const r = el.getBoundingClientRect()
          if (!r.width || r.height > 36 || r.width > 150) continue
          const cy = r.top + r.height / 2 + oy
          const cx = r.left + r.width / 2 + ox
          if (cy < R.y - 10 || cy > R.y + R.h + 10) continue
          if (cx >= R.x + R.w * 0.72 && cx <= R.x + R.w + 90) right.push({ y: cy, p })
          else if (cx >= R.x - 90 && cx <= R.x + R.w * 0.28) left.push({ y: cy, p })
        }
      }
    } catch {
      return false
    }
    // y 오름차순에서 가격이 계속 감소하는 최장 부분열만 남긴다 (지표 배지 등 잡음 제거)
    const chain = (pts: Pt[]): Pt[] => {
      const a = [...pts].sort((m, n) => m.y - n.y)
      let best: Pt[] = []
      for (let i = 0; i < a.length; i++) {
        const c = [a[i]]
        for (let j = i + 1; j < a.length; j++) {
          if (a[j].p < c[c.length - 1].p && a[j].y > c[c.length - 1].y + 6) c.push(a[j])
        }
        if (c.length > best.length) best = c
      }
      return best
    }
    const pick = [chain(right), chain(left)].sort((m, n) => n.length - m.length)[0]
    if (!pick || pick.length < 2) return false
    const first = pick[0]
    const last = pick[pick.length - 1]
    if (last.y - first.y < 40 || first.p <= last.p) return false
    // 눈금이 등간격 선형인지 검사 — 아무 숫자나 주운 경우를 걸러낸다
    const slope = (last.p - first.p) / (last.y - first.y)
    for (const pt of pick) {
      const expect = first.p + slope * (pt.y - first.y)
      const tol = (first.p - last.p) * 0.06 + Math.abs(expect) * 0.002
      if (Math.abs(pt.p - expect) > tol) return false
    }
    // 현재가가 이 매핑에서 차트 근처로 떨어져야 진짜 가격축이다
    const yCur = first.y + (currentPrice - first.p) / slope
    if (yCur < R.y - R.h * 0.5 || yCur > R.y + R.h * 1.5) return false
    calib = { y1: first.y, p1: first.p, y2: last.y, p2: last.p }
    return true
  }

  function priceToY(price: number): number | null {
    if (!calib || calib.p2 === calib.p1) return null
    return calib.y1 + ((price - calib.p1) * (calib.y2 - calib.y1)) / (calib.p2 - calib.p1)
  }

  /** 역변환 — 보정돼 있으면 수평선에 가격 라벨을 붙일 수 있다 */
  function yToPrice(y: number): number | null {
    if (!calib || calib.y2 === calib.y1) return null
    return calib.p1 + ((y - calib.y1) * (calib.p2 - calib.p1)) / (calib.y2 - calib.y1)
  }

  function renderLevels(levels: LevelIn[]) {
    drawings = drawings.filter((d) => d.type !== 'level')
    const R = chartRect()
    for (const l of levels) {
      const y = priceToY(l.price)
      if (y == null || y < R.y || y > R.y + R.h) continue
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
    } else if (mode === 'trend' || mode === 'region') {
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
    if (!drag) return
    if (mode === 'region') {
      const w2 = Math.abs(drag.x2 - drag.x1)
      const h2 = Math.abs(drag.y2 - drag.y1)
      if (w2 > 80 && h2 > 60) {
        region = { x: Math.min(drag.x1, drag.x2), y: Math.min(drag.y1, drag.y2), w: w2, h: h2 }
        showToast('차트 영역을 지정했어 — 이제 선이 이 안에만 그려져')
      }
      drag = null
      setMode(null)
      redraw()
      return
    }
    drawings.push({ type: 't', ...drag })
    drag = null
    redraw()
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
      if (!region) autoDetectRegion()
      // 1순위: 축 눈금 자동 인식 (클릭 불필요, 매번 새로 읽어 줌/스크롤 반영) → 실패 시 수동 2점 보정
      if (autoCalibrateFromAxis(currentPrice)) {
        renderLevels(levels)
        showToast('차트 눈금을 자동 인식해서 그렸어 — 차트를 움직였으면 다시 긋기')
      } else if (!calib) {
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
