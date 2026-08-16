/**
 * HOLD 사이드 패널 — 보고 있는 페이지의 종목을 인식해 실시세·레벨·손익비를 보여준다.
 * 시세: HOLD prices 엣지 함수(KIS 직접 연동, CORS 개방) — 확장에 키 없음.
 * 수치는 전부 결정적 계산. 문장은 사실·조건문만 (지시어 금지).
 */

const FN = 'https://xpjtgmckrazfbyghkeve.supabase.co/functions/v1/prices'
const APP_URL = 'https://hold.vercel.app' // 배포 주소가 다르면 여기만 교체

interface Quote {
  price: number
  changePercent: number | null
  previousClose: number
  currency: string
}

interface Level {
  price: number
  kind: 'support' | 'resistance'
  touches: number
}

let tabId: number | null = null
let symbol: string | null = null
let quote: Quote | null = null
let levels: Level[] = []

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T

// ─── 심볼 인식 (URL/타이틀 어댑터 — DOM 은 읽지 않음) ─────────────────────
function detectSymbol(url: string, title: string): { code: string; label: string } | null {
  try {
    const u = new URL(url)
    const h = u.hostname
    let m: RegExpMatchArray | null
    if (h.endsWith('finance.naver.com')) {
      m = u.search.match(/code=(\d{6})/)
      if (m) return { code: m[1], label: title.split(/[:|-]/)[0].trim() || m[1] }
    }
    if (h.endsWith('m.stock.naver.com') || h.endsWith('stock.naver.com')) {
      m = u.pathname.match(/\/(?:domestic|worldstock)\/(?:stock|index)\/([A-Za-z0-9.]{1,12})/)
      if (m) {
        const raw = m[1].toUpperCase()
        const code = raw.replace(/\.[OKN]$/, '') // AAPL.O 형태 정리
        return { code, label: title.split(/[:|-]/)[0].trim() || code }
      }
    }
    if (h.endsWith('tradingview.com')) {
      m =
        (u.search + ' ' + u.pathname).match(/symbol=(?:[A-Z]+(?:%3A|:))?([A-Z0-9.]{1,10})/) ||
        u.pathname.match(/symbols\/(?:KRX-)?([A-Z0-9.]{1,10})/)
      if (m) return { code: m[1].toUpperCase(), label: m[1].toUpperCase() }
    }
    if (h.endsWith('tossinvest.com')) {
      m = u.pathname.match(/stocks\/([A-Za-z0-9]{1,12})/)
      if (m && /^\d{6}$/.test(m[1])) return { code: m[1], label: title.split(/[:|-]/)[0].trim() || m[1] }
    }
    // 일반 폴백: URL 안의 6자리 코드 (uuid 라우트를 쓰는 사이트는 오탐 방지 위해 제외)
    if (!h.endsWith('stockersclub.com')) {
      m = url.match(/[^0-9a-fA-F](\d{6})(?:[^0-9a-fA-F]|$)/)
      if (m) return { code: m[1], label: title.split(/[:|-]/)[0].trim() || m[1] }
    }
  } catch {
    /* URL 파싱 실패 무시 */
  }
  return null
}

/**
 * URL 로 못 찾을 때: 페이지 제목·og:title·헤더 텍스트에서 심볼 패턴만 찾는다.
 * (사용자가 부른 탭에서만 실행, 아무것도 저장하지 않음 — 차트 픽셀·개인정보는 읽지 않는다)
 * 스토커스클럽 방 헤더 "TSLA $341.63" 같은 패턴을 잡는다.
 */
async function detectFromPage(tid: number): Promise<{ code: string; label: string } | null> {
  try {
    const [res] = await chrome.scripting.executeScript({
      target: { tabId: tid },
      func: () => {
        const texts: string[] = [document.title]
        const og = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null
        if (og?.content) texts.push(og.content)
        const h1 = document.querySelector('h1')
        if (h1?.textContent) texts.push(h1.textContent)
        texts.push((document.body?.innerText || '').slice(0, 3000))
        for (const s of texts) {
          if (!s) continue
          let m = s.match(/\((\d{6})\)/) || s.match(/(?:^|[^0-9])(\d{6})(?:[^0-9]|$)/)
          if (m) return { code: m[1], label: s.split(/[:|(\-]/)[0].trim().slice(0, 20) || m[1] }
          m = s.match(/\$([A-Z]{1,6})\b/) || s.match(/\b([A-Z]{2,6})\s*\$\s?\d/) || s.match(/^\s*([A-Z]{2,6})\s*[:\-]/)
          if (m) return { code: m[1], label: m[1] }
        }
        return null
      },
    })
    return (res?.result as { code: string; label: string } | null) ?? null
  } catch {
    return null
  }
}

// ─── 지지/저항 (스윙 피벗 → 1% 클러스터, 결정적) ──────────────────────────
function swingLevels(closes: number[], current: number): Level[] {
  const piv: number[] = []
  for (let i = 2; i < closes.length - 2; i++) {
    const c = closes[i]
    const hi = c >= closes[i - 1] && c >= closes[i - 2] && c >= closes[i + 1] && c >= closes[i + 2]
    const lo = c <= closes[i - 1] && c <= closes[i - 2] && c <= closes[i + 1] && c <= closes[i + 2]
    if (hi || lo) piv.push(c)
  }
  const clusters: { sum: number; n: number }[] = []
  for (const p of piv.sort((a, b) => a - b)) {
    const last = clusters[clusters.length - 1]
    if (last && Math.abs(p - last.sum / last.n) / (last.sum / last.n) < 0.01) {
      last.sum += p
      last.n++
    } else {
      clusters.push({ sum: p, n: 1 })
    }
  }
  const pts = clusters.map((c) => ({ price: c.sum / c.n, touches: c.n }))
  const sup = pts.filter((p) => p.price < current).sort((a, b) => b.price - a.price).slice(0, 2)
  const res = pts.filter((p) => p.price > current).sort((a, b) => a.price - b.price).slice(0, 2)
  return [
    ...sup.map((p) => ({ ...p, kind: 'support' as const })),
    ...res.map((p) => ({ ...p, kind: 'resistance' as const })),
  ]
}

const fmt = (n: number, currency = 'KRW') =>
  currency === 'KRW' ? `${Math.round(n).toLocaleString('ko-KR')}원` : `$${(Math.round(n * 100) / 100).toLocaleString('en-US')}`

// ─── 데이터 로드 ──────────────────────────────────────────────────────────
async function loadSymbol(code: string, label: string) {
  symbol = code
  $('symEmpty').style.display = 'none'
  $('symInfo').style.display = 'block'
  $('symName').textContent = label
  $('symCode').textContent = code
  $('symPrice').textContent = '…'
  $('symChange').textContent = ''
  try {
    const [qRes, kRes] = await Promise.all([
      fetch(`${FN}/quotes?symbols=${encodeURIComponent(code)}`).then((r) => r.json()),
      fetch(`${FN}/klines?symbol=${encodeURIComponent(code)}&limit=90`).then((r) => r.json()),
    ])
    quote = qRes?.quotes?.[code] ?? null
    const closes: number[] = (kRes?.candles ?? []).map((c: { close: number }) => c.close).filter((v: number) => v > 0)
    if (quote) {
      $('symPrice').textContent = fmt(quote.price, quote.currency)
      const ch = quote.changePercent
      if (ch != null) {
        const up = ch >= 0
        $('symChange').textContent = `${up ? '+' : ''}${ch.toFixed(2)}%`
        $('symChange').style.color = up ? '#E36A5C' : '#7FA8E8'
      }
      const entry = $<HTMLInputElement>('rrEntry')
      if (!entry.value) entry.value = String(quote.price)
    } else {
      $('symPrice').textContent = '시세 없음'
    }
    levels = quote && closes.length >= 10 ? swingLevels(closes, quote.price) : []
    renderLevels()
  } catch {
    $('symPrice').textContent = '연결 실패'
  }
}

function renderLevels() {
  const card = $('levelCard')
  const list = $('levelList')
  if (!levels.length || !quote) {
    card.style.display = 'none'
    return
  }
  card.style.display = 'block'
  list.innerHTML = ''
  for (const l of [...levels].sort((a, b) => b.price - a.price)) {
    const row = document.createElement('div')
    row.className = 'row'
    row.style.padding = '5px 0'
    const name = document.createElement('span')
    name.textContent = l.kind === 'support' ? '지지' : '저항'
    name.style.color = l.kind === 'support' ? '#57C7A4' : '#FF6B77'
    name.style.fontWeight = '700'
    name.style.fontSize = '11.5px'
    const price = document.createElement('span')
    price.className = 'mono'
    price.textContent = fmt(l.price, quote.currency)
    const touches = document.createElement('span')
    touches.className = 'faint'
    touches.textContent = `${l.touches}번 터치`
    const sp = document.createElement('span')
    sp.style.flex = '1'
    row.append(name, price, sp, touches)
    list.appendChild(row)
  }
}

// ─── 손익비 ───────────────────────────────────────────────────────────────
function calcRR() {
  const e = Number($<HTMLInputElement>('rrEntry').value)
  const s = Number($<HTMLInputElement>('rrStop').value)
  const t = Number($<HTMLInputElement>('rrTarget').value)
  const out = $('rrOut')
  const note = $('rrNote')
  if (!(e > 0 && s > 0 && t > 0)) {
    out.textContent = '손익비 —'
    out.style.color = '#F2F4F8'
    note.textContent = ''
    return
  }
  const reward = ((t - e) / e) * 100
  const risk = ((e - s) / e) * 100
  if (risk <= 0 || reward <= 0) {
    out.textContent = '손익비 —'
    note.textContent = '상승 계획 기준: 손절가 < 진입가 < 목표가'
    return
  }
  const rr = reward / risk
  out.textContent = `손익비 1 : ${(Math.round(rr * 10) / 10).toFixed(1)}`
  out.style.color = rr < 1 ? '#FF6B77' : '#F2F4F8'
  note.textContent =
    rr < 1
      ? `잃을 폭(${risk.toFixed(1)}%)이 벌 폭(${reward.toFixed(1)}%)보다 커요`
      : `벌 폭 +${reward.toFixed(1)}% vs 잃을 폭 −${risk.toFixed(1)}%`
}

// ─── 콘텐츠 스크립트 통신 ─────────────────────────────────────────────────
async function ensureContent(): Promise<boolean> {
  if (tabId == null) return false
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'HOLD_PING' })
    return true
  } catch {
    try {
      await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] })
      return true
    } catch {
      alert('이 페이지에는 그릴 수 없어요 (크롬 내부 페이지 등). 주식 사이트 탭에서 다시 시도해줘.')
      return false
    }
  }
}

async function send(msg: unknown) {
  if (!(await ensureContent()) || tabId == null) return
  try {
    await chrome.tabs.sendMessage(tabId, msg)
  } catch {
    /* 탭이 사라진 경우 무시 */
  }
}

// ─── 탭 동기화 ────────────────────────────────────────────────────────────
async function syncTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id || !tab.url) return
  tabId = tab.id
  let found = detectSymbol(tab.url, tab.title ?? '')
  if (!found && /^https?:/.test(tab.url)) {
    found = await detectFromPage(tab.id)
  }
  if (found && found.code !== symbol) {
    await loadSymbol(found.code, found.label)
  } else if (!found && !symbol) {
    $('symEmpty').style.display = 'block'
    $('symInfo').style.display = 'none'
  }
}

// ─── 이벤트 ───────────────────────────────────────────────────────────────
$('reDetect').addEventListener('click', () => {
  symbol = null
  void syncTab()
})
$('symGo').addEventListener('click', () => {
  const v = $<HTMLInputElement>('symInput').value.trim().toUpperCase()
  if (v) void loadSymbol(v, v)
})
$<HTMLInputElement>('symInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') $('symGo').click()
})

$('drawLevels').addEventListener('click', () => {
  if (!quote || !levels.length) return
  void send({
    type: 'HOLD_DRAW_LEVELS',
    currentPrice: quote.price,
    levels: levels.map((l) => ({
      price: Math.round(l.price * 100) / 100,
      kind: l.kind,
      label: `${l.kind === 'support' ? '지지' : '저항'} ${fmt(l.price, quote!.currency)} · ${l.touches}번 터치`,
    })),
  })
})

$('rrDraw').addEventListener('click', () => {
  const e = Number($<HTMLInputElement>('rrEntry').value)
  const s = Number($<HTMLInputElement>('rrStop').value)
  const t = Number($<HTMLInputElement>('rrTarget').value)
  if (!(e > 0 && s > 0 && t > 0) || !quote) return
  void send({
    type: 'HOLD_DRAW_LEVELS',
    currentPrice: quote.price,
    levels: [
      { price: e, kind: 'entry', label: `진입 ${fmt(e, quote.currency)}` },
      { price: s, kind: 'stop', label: `손절 ${fmt(s, quote.currency)}` },
      { price: t, kind: 'target', label: `목표 ${fmt(t, quote.currency)}` },
    ],
  })
})

$('modeH').addEventListener('click', () => void send({ type: 'HOLD_SET_MODE', mode: 'hline' }))
$('modeT').addEventListener('click', () => void send({ type: 'HOLD_SET_MODE', mode: 'trend' }))
$('clearAll').addEventListener('click', () => void send({ type: 'HOLD_CLEAR' }))
for (const id of ['rrEntry', 'rrStop', 'rrTarget']) {
  $<HTMLInputElement>(id).addEventListener('input', calcRR)
}
;($('appLink') as HTMLAnchorElement).href = APP_URL

chrome.tabs.onActivated.addListener(() => void syncTab())
chrome.tabs.onUpdated.addListener((_id, info) => {
  if (info.status === 'complete' || info.url) void syncTab()
})
void syncTab()
