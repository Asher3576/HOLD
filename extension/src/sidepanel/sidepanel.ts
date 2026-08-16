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
let symbolLabel = ''
let quote: Quote | null = null
let levels: Level[] = []
let closesG: number[] = []

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
      // 토스증권 웹: /stocks/A009150/... (KR 은 A+6자리), 미국은 티커 그대로
      m = u.pathname.match(/stocks\/A?(\d{6})(?:[/?#]|$)/)
      if (m) return { code: m[1], label: title.split(/[:|·-]/)[0].trim() || m[1] }
      m = u.pathname.match(/stocks\/([A-Z]{1,6})(?:[/?#]|$)/)
      if (m) return { code: m[1], label: m[1] }
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
  symbolLabel = label
  $('symEmpty').style.display = 'none'
  $('symInfo').style.display = 'block'
  $('symName').textContent = label
  $('symCode').textContent = code
  $('symPrice').textContent = '…'
  $('symChange').textContent = ''
  try {
    const getQuote = () =>
      fetch(`${FN}/quotes?symbols=${encodeURIComponent(code)}`)
        .then((r) => r.json())
        .then((j) => (j?.quotes?.[code] ?? null) as Quote | null)
        .catch(() => null)
    const [q0, kRes] = await Promise.all([
      getQuote(),
      fetch(`${FN}/klines?symbol=${encodeURIComponent(code)}&limit=90`).then((r) => r.json()),
    ])
    quote = q0
    const closes: number[] = (kRes?.candles ?? []).map((c: { close: number }) => c.close).filter((v: number) => v > 0)
    closesG = closes
    // KIS 공식 종목명이 오면 그걸 쓴다 (탭 제목 추정보다 정확)
    const kisName = typeof kRes?.name === 'string' ? kRes.name.trim() : ''
    if (kisName && symbol === code) {
      symbolLabel = kisName
      $('symName').textContent = kisName
    }
    if (!quote) {
      // 엣지 콜드스타트/KIS 토큰 발급 직후 순간 실패 — 1.5초 뒤 한 번 더
      await new Promise((r) => setTimeout(r, 1500))
      quote = await getQuote()
    }
    let basis = '정규장 기준 · 시간외 미반영'
    if (!quote && closes.length >= 2) {
      // 시세 실패 시 일봉 종가로 폴백 — 화면이 죽지 않게
      const last = closes[closes.length - 1]
      const prev = closes[closes.length - 2]
      quote = {
        price: last,
        changePercent: prev > 0 ? ((last - prev) / prev) * 100 : null,
        previousClose: prev,
        currency: /^\d{6}$/.test(code) ? 'KRW' : 'USD',
      }
      basis = '최근 종가 기준'
    }
    $('symBasis').textContent = basis
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
    renderTrend()
    renderFacts()
    void loadNews()
  } catch {
    $('symPrice').textContent = '연결 실패'
  }
}

// ─── 추세 (SMA20/60 — 사실만) ─────────────────────────────────────────────
function smaAt(a: number[], n: number, back = 0): number | null {
  const end = a.length - back
  if (end - n < 0) return null
  const s = a.slice(end - n, end)
  return s.reduce((x, y) => x + y, 0) / n
}

function trendLine(closes: number[], n: number, slopeBack: number): { dir: string; text: string } | null {
  const last = closes[closes.length - 1]
  const now = smaAt(closes, n)
  const before = smaAt(closes, n, slopeBack)
  if (now == null || before == null) return null
  const above = last > now
  const rising = now > before
  const falling = now < before
  const dir = above && rising ? '상승' : !above && falling ? '하락' : '횡보'
  return {
    dir,
    text: `종가가 ${n}일선 ${above ? '위' : '아래'} · ${n}일선 ${rising ? '우상향' : falling ? '우하향' : '수평'}`,
  }
}

const DIR_COLOR: Record<string, string> = { 상승: '#E36A5C', 하락: '#7FA8E8', 횡보: '#99A1B3' }

function renderTrend() {
  const card = $('trendCard')
  const s = trendLine(closesG, 20, 5)
  const l = trendLine(closesG, 60, 10)
  if (!s && !l) {
    card.style.display = 'none'
    return
  }
  card.style.display = 'block'
  const mk = (label: string, t: { dir: string; text: string } | null) =>
    t
      ? `<span style="color:#7A8296">${label}</span> <b style="color:${DIR_COLOR[t.dir]}">${t.dir}</b> <span style="color:#99A1B3">— ${t.text}</span>`
      : `<span style="color:#7A8296">${label}</span> <span style="color:#5A6170">데이터 부족</span>`
  $('trendShort').innerHTML = mk('단기(20일):', s)
  $('trendLong').innerHTML = mk('장기(60일):', l)
}

// ─── 특이사항 (계산된 사실) ───────────────────────────────────────────────
function renderFacts() {
  const list = $('factList')
  list.innerHTML = ''
  if (!quote || closesG.length < 20) return
  $('newsCard').style.display = 'block'
  const cur = quote.currency
  const last = quote.price
  const hi = Math.max(...closesG)
  const lo = Math.min(...closesG)
  const diffs: number[] = []
  for (let i = closesG.length - 20; i < closesG.length; i++) {
    if (i <= 0) continue
    diffs.push(Math.abs((closesG[i] - closesG[i - 1]) / closesG[i - 1]) * 100)
  }
  const avgVol = diffs.length ? diffs.reduce((a, b) => a + b, 0) / diffs.length : 0
  const facts: string[] = []
  const ch = quote.changePercent
  if (ch != null && avgVol > 0 && Math.abs(ch) > avgVol * 2) {
    facts.push(`오늘 변동(${ch >= 0 ? '+' : ''}${ch.toFixed(1)}%)이 평소 하루 평균(±${avgVol.toFixed(1)}%)보다 커요`)
  }
  facts.push(`최근 90일 고점(${fmt(hi, cur)}) 대비 ${(((last - hi) / hi) * 100).toFixed(1)}% · 저점(${fmt(lo, cur)}) 대비 +${(((last - lo) / lo) * 100).toFixed(1)}%`)
  if (avgVol > 0) facts.push(`최근 20일 하루 평균 변동 ±${avgVol.toFixed(1)}%`)
  for (const f of facts) {
    const row = document.createElement('div')
    row.style.cssText = 'font-size:11.5px;line-height:1.55;color:#D6DAE3;padding:3px 0'
    row.textContent = '· ' + f
    list.appendChild(row)
  }
}

// ─── 뉴스 ─────────────────────────────────────────────────────────────────
function timeAgo(pub: string): string {
  const t = new Date(pub).getTime()
  if (!Number.isFinite(t)) return ''
  const m = Math.max(0, Math.round((Date.now() - t) / 60_000))
  if (m < 60) return `${m}분 전`
  if (m < 1440) return `${Math.round(m / 60)}시간 전`
  return `${Math.round(m / 1440)}일 전`
}

async function loadNews() {
  const list = $('newsList')
  list.innerHTML = ''
  const q = (symbolLabel && !/^\d{6}$/.test(symbolLabel) ? symbolLabel : symbol) ?? ''
  if (!q) return
  try {
    const res = await fetch(`${FN}/news?q=${encodeURIComponent(q + ' 주가')}`).then((r) => r.json())
    const items: Array<{ title: string; link: string; pub: string; source: string }> = res?.items ?? []
    if (!items.length) return
    $('newsCard').style.display = 'block'
    for (const it of items.slice(0, 4)) {
      const a = document.createElement('a')
      a.href = it.link
      a.target = '_blank'
      a.rel = 'noreferrer'
      a.style.cssText =
        'display:block;padding:7px 0;border-top:1px solid rgba(255,255,255,0.07);color:#D6DAE3;font-size:12px;line-height:1.5;text-decoration:none'
      const meta = [it.source, timeAgo(it.pub)].filter(Boolean).join(' · ')
      a.innerHTML = `${it.title}${meta ? `<span style="display:block;margin-top:2px;font-size:10px;color:#5A6170">${meta}</span>` : ''}`
      list.appendChild(a)
    }
  } catch {
    /* 뉴스 실패는 조용히 */
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

// ─── 네이티브 작도 (토스/트레이딩뷰 차트 내부 위젯 — 비공식, 실패 시 오버레이 폴백) ──
interface NativeLine {
  price: number
  title: string
  color: string
  dashed: boolean
}

/**
 * 페이지 MAIN 월드에서 TradingView 위젯을 찾아 진짜 수평선 작도를 생성.
 * 탐색 순서: 알려진 전역 이름(tradingViewApi 등) → window 전 프로퍼티 →
 * 같은 출처 iframe 내부(차팅 라이브러리는 자체 iframe 의 tradingViewApi 에 API 를 둔다).
 */
async function tvNativeDraw(lines: NativeLine[]): Promise<number> {
  if (tabId == null) return 0
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      world: 'MAIN',
      func: (lines: NativeLine[]) => {
        type ChartApi = {
          createShape: (point: unknown, opts: unknown) => unknown
          removeEntity?: (id: unknown) => void
        }
        const asChart = (v: unknown): ChartApi | null => {
          if (!v || (typeof v !== 'object' && typeof v !== 'function')) return null
          try {
            const o = v as { activeChart?: () => unknown; createShape?: unknown; removeEntity?: unknown }
            if (typeof o.activeChart === 'function') {
              const c = o.activeChart() as ChartApi | null
              if (c && typeof c.createShape === 'function') return c
            }
            if (typeof o.createShape === 'function' && typeof o.removeEntity === 'function') {
              return o as unknown as ChartApi
            }
          } catch {
            /* cross-origin/게터 예외 무시 */
          }
          return null
        }
        const findChart = (w: Record<string, unknown>): ChartApi | null => {
          for (const k of ['tradingViewApi', 'tvWidget', 'widget', 'chartWidget', 'TradingViewApi']) {
            try {
              const c = asChart(w[k])
              if (c) return c
            } catch {
              /* 무시 */
            }
          }
          let names: string[] = []
          try {
            names = Object.getOwnPropertyNames(w)
          } catch {
            /* 무시 */
          }
          for (const k of names) {
            if (k.startsWith('on') || k.startsWith('webkit')) continue
            let v: unknown
            try {
              v = w[k]
            } catch {
              continue
            }
            const c = asChart(v)
            if (c) return c
          }
          return null
        }
        const wins: Record<string, unknown>[] = [window as unknown as Record<string, unknown>]
        try {
          for (const f of Array.from(document.querySelectorAll('iframe'))) {
            try {
              const cw = (f as HTMLIFrameElement).contentWindow
              if (cw && cw.document) wins.push(cw as unknown as Record<string, unknown>)
            } catch {
              /* cross-origin 프레임 제외 */
            }
          }
        } catch {
          /* 무시 */
        }
        for (const w of wins) {
          const chart = findChart(w)
          if (!chart) continue
          const ids: unknown[] = []
          let n = 0
          for (const l of lines) {
            try {
              const id = chart.createShape(
                { time: Math.floor(Date.now() / 1000), price: l.price },
                {
                  shape: 'horizontal_line',
                  disableSave: true,
                  text: l.title,
                  overrides: {
                    linecolor: l.color,
                    linewidth: 2,
                    linestyle: l.dashed ? 2 : 0,
                    showLabel: true,
                    text: l.title,
                    textcolor: l.color,
                    horzLabelsAlign: 'right',
                    fontsize: 11,
                  },
                },
              )
              if (id != null) {
                ids.push(id)
                n++
              }
            } catch {
              /* 개별 선 실패 무시 */
            }
          }
          if (n > 0) {
            const store = w as { __HOLD_TV_IDS?: unknown[] }
            store.__HOLD_TV_IDS = (store.__HOLD_TV_IDS ?? []).concat(ids)
            return n
          }
        }
        return 0
      },
      args: [lines],
    })
    return results.reduce((sum, r) => sum + (Number(r?.result) || 0), 0)
  } catch {
    return 0
  }
}

/** 네이티브로 그린 선 제거 — tvNativeDraw 와 같은 방식으로 위젯을 찾아 지운다 */
async function tvNativeClear(): Promise<void> {
  if (tabId == null) return
  try {
    await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      world: 'MAIN',
      func: () => {
        type ChartApi = { removeEntity: (id: unknown) => void }
        const asChart = (v: unknown): ChartApi | null => {
          if (!v || (typeof v !== 'object' && typeof v !== 'function')) return null
          try {
            const o = v as { activeChart?: () => unknown; removeEntity?: unknown }
            if (typeof o.activeChart === 'function') {
              const c = o.activeChart() as ChartApi | null
              if (c && typeof c.removeEntity === 'function') return c
            }
            if (typeof o.removeEntity === 'function') return o as unknown as ChartApi
          } catch {
            /* 무시 */
          }
          return null
        }
        const findChart = (w: Record<string, unknown>): ChartApi | null => {
          for (const k of ['tradingViewApi', 'tvWidget', 'widget', 'chartWidget', 'TradingViewApi']) {
            try {
              const c = asChart(w[k])
              if (c) return c
            } catch {
              /* 무시 */
            }
          }
          let names: string[] = []
          try {
            names = Object.getOwnPropertyNames(w)
          } catch {
            /* 무시 */
          }
          for (const k of names) {
            if (k.startsWith('on') || k.startsWith('webkit')) continue
            let v: unknown
            try {
              v = w[k]
            } catch {
              continue
            }
            const c = asChart(v)
            if (c) return c
          }
          return null
        }
        const wins: Record<string, unknown>[] = [window as unknown as Record<string, unknown>]
        try {
          for (const f of Array.from(document.querySelectorAll('iframe'))) {
            try {
              const cw = (f as HTMLIFrameElement).contentWindow
              if (cw && cw.document) wins.push(cw as unknown as Record<string, unknown>)
            } catch {
              /* cross-origin 프레임 제외 */
            }
          }
        } catch {
          /* 무시 */
        }
        for (const w of wins) {
          const store = w as { __HOLD_TV_IDS?: unknown[] }
          const ids = store.__HOLD_TV_IDS ?? []
          if (!ids.length) continue
          const chart = findChart(w)
          if (chart) {
            for (const id of ids) {
              try {
                chart.removeEntity(id)
              } catch {
                /* 이미 지워진 선 무시 */
              }
            }
          }
          store.__HOLD_TV_IDS = []
        }
      },
    })
  } catch {
    /* 무시 */
  }
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
/**
 * 라벨 정리 — 토스 등은 탭 제목이 "1,165,000원 +4.29% · SK스퀘어"처럼 가격으로 시작해서
 * 첫 조각을 그대로 쓰면 종목명 자리에 가격이 들어간다. 가격/퍼센트 조각을 걷어내고
 * 제목의 모든 조각을 훑어 진짜 이름을 찾는다. 못 찾으면 코드.
 */
function cleanLabel(raw: string, title: string, code: string): string {
  const strip = (s: string) =>
    s
      .replace(/[+\-]?\d[\d,]*(?:\.\d+)?\s*(?:원|%)/g, ' ')
      .replace(/[₩$][\d,.]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
  const bad = (s: string) => !s || s.length > 20 || /[%₩$]|\d\s*원|\d[,.]\d|^[\d\s.,+\-]+$/.test(s)
  for (const cand of [raw.trim(), strip(raw)]) if (!bad(cand)) return cand
  for (const seg of title.split(/[|·:–—-]/)) {
    for (const cand of [seg.trim(), strip(seg)]) if (!bad(cand)) return cand
  }
  return code
}

let pollTimer: number | undefined
let pollLeft = 0

async function syncTab(fromPoll = false) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id || !tab.url) return
  if (!fromPoll) {
    clearTimeout(pollTimer)
    pollLeft = 8 // SPA 렌더 대기 — 최대 ~10초 자동 재시도
  }
  tabId = tab.id
  let found = detectSymbol(tab.url, tab.title ?? '')
  if (!found && /^https?:/.test(tab.url)) {
    found = await detectFromPage(tab.id)
  }
  // URL 어댑터든 페이지 텍스트든 라벨은 항상 정리 (탭 제목이 가격으로 시작하는 사이트 대응)
  if (found) found.label = cleanLabel(found.label, tab.title ?? '', found.code)
  if (found && found.code !== symbol) {
    clearTimeout(pollTimer)
    await loadSymbol(found.code, found.label)
    return
  }
  if (!found && !symbol) {
    $('symEmpty').style.display = 'block'
    $('symInfo').style.display = 'none'
    if (pollLeft-- > 0) {
      pollTimer = window.setTimeout(() => void syncTab(true), 1300)
    }
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
  void (async () => {
    // 1순위: 페이지 안 TradingView 차트에 진짜 작도 (토스증권 등 — 줌/스크롤 추종)
    const native = await tvNativeDraw(
      levels.map((l) => ({
        price: Math.round(l.price * 100) / 100,
        title: `${l.kind === 'support' ? '지지' : '저항'} ${fmt(l.price, quote!.currency)} · ${l.touches}번 터치`,
        color: l.kind === 'support' ? '#57C7A4' : '#FF6B77',
        dashed: true,
      })),
    )
    if (native > 0) {
      $('levelHint').textContent = '차트 자체에 그렸어요 — 줌/스크롤을 따라가요 · [지우기]로 제거'
      return
    }
    // 폴백: 화면 오버레이 (축 눈금 자동 인식 → 안 되면 2점 보정)
    $('levelHint').textContent = '축 눈금을 자동 인식해요 · 안 되면 화면 보정 2번'
    void send({
      type: 'HOLD_DRAW_LEVELS',
      currentPrice: quote!.price,
      levels: levels.map((l) => ({
        price: Math.round(l.price * 100) / 100,
        kind: l.kind,
        label: `${l.kind === 'support' ? '지지' : '저항'} ${fmt(l.price, quote!.currency)} · ${l.touches}번 터치`,
      })),
    })
  })()
})

$('rrDraw').addEventListener('click', () => {
  const e = Number($<HTMLInputElement>('rrEntry').value)
  const s = Number($<HTMLInputElement>('rrStop').value)
  const t = Number($<HTMLInputElement>('rrTarget').value)
  if (!(e > 0 && s > 0 && t > 0) || !quote) return
  void (async () => {
    const native = await tvNativeDraw([
      { price: e, title: `진입 ${fmt(e, quote!.currency)}`, color: '#F2F4F8', dashed: false },
      { price: s, title: `손절 ${fmt(s, quote!.currency)}`, color: '#FF6B77', dashed: true },
      { price: t, title: `목표 ${fmt(t, quote!.currency)}`, color: '#57C7A4', dashed: true },
    ])
    if (native > 0) return
    void send({
      type: 'HOLD_DRAW_LEVELS',
      currentPrice: quote!.price,
      levels: [
        { price: e, kind: 'entry', label: `진입 ${fmt(e, quote!.currency)}` },
        { price: s, kind: 'stop', label: `손절 ${fmt(s, quote!.currency)}` },
        { price: t, kind: 'target', label: `목표 ${fmt(t, quote!.currency)}` },
      ],
    })
  })()
})

$('modeH').addEventListener('click', () => void send({ type: 'HOLD_SET_MODE', mode: 'hline' }))
$('modeT').addEventListener('click', () => void send({ type: 'HOLD_SET_MODE', mode: 'trend' }))
$('clearAll').addEventListener('click', () => {
  void tvNativeClear() // 차트 자체에 그린 선
  void send({ type: 'HOLD_CLEAR' }) // 오버레이에 그린 선
})
for (const id of ['rrEntry', 'rrStop', 'rrTarget']) {
  $<HTMLInputElement>(id).addEventListener('input', calcRR)
}
;($('appLink') as HTMLAnchorElement).href = APP_URL

chrome.tabs.onActivated.addListener(() => void syncTab())
chrome.tabs.onUpdated.addListener((_id, info) => {
  if (info.status === 'complete' || info.url) void syncTab()
})
void syncTab()
