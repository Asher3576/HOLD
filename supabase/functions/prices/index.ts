// HOLD 시세 — 한국투자증권(KIS) Open API 직접 연동.
// 국내(6자리 코드) 실시간 + 해외(미국 티커, 기본 15분 지연·무료실시간 신청 시 실시간).
// IP 화이트리스트 없음 → Supabase Edge 에서 직접 호출. 프록시/타사 의존 없음.
//
// 시크릿(대시보드 → Edge Functions → Secrets):
//   KIS_APP_KEY, KIS_APP_SECRET  (한국투자증권 KIS Developers 실전투자 앱키)
// 미설정 시 kis-not-configured 반환 → 웹앱은 목데이터로 자동 폴백.
//
// 라우트:
//   GET /prices/health
//   GET /prices/quotes?symbols=005930,TSLA
//   GET /prices/klines?symbol=005930&limit=60
//   GET /prices/news?q=삼성전자 주가
//   GET /prices/brief?labels=삼성전자,테슬라   ← Gemini 요약 (GEMINI_API_KEY 시크릿, 없으면 헤드라인만)

const APP_KEY = Deno.env.get('KIS_APP_KEY') ?? Deno.env.get('KIS_API_KEY') ?? ''
const APP_SECRET = Deno.env.get('KIS_APP_SECRET') ?? Deno.env.get('KIS_API_SECRET') ?? ''
const BASE = 'https://openapi.koreainvestment.com:9443'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

function json(body: unknown, status?: number, sMaxAge?: number) {
  const headers: Record<string, string> = { ...CORS, 'Content-Type': 'application/json' }
  if (sMaxAge) headers['Cache-Control'] = 'public, s-maxage=' + sMaxAge
  return new Response(JSON.stringify(body), { status: status || 200, headers })
}

// ─── 토큰 (24h 유효) ────────────────────────────────────────────────────────
// 엣지 인스턴스는 여러 개가 뜨고 콜드스타트마다 메모리가 초기화되므로,
// 메모리 캐시만 쓰면 인스턴스가 뜰 때마다 재발급하게 된다 (KIS 발급 알림 폭탄).
// → 발급된 토큰을 DB(app_cache, service role 전용)에 공유 저장해 24시간 1회만 발급.
let tokenCache = { token: '', expiresAt: 0 }

const SB_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SB_SVC = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const TOKEN_KEY = 'kis:token'

async function dbLoadToken(): Promise<{ token: string; expiresAt: number } | null> {
  if (!SB_URL || !SB_SVC) return null
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/app_cache?key=eq.${encodeURIComponent(TOKEN_KEY)}&select=value`,
      { headers: { apikey: SB_SVC, Authorization: `Bearer ${SB_SVC}` }, signal: AbortSignal.timeout(5_000) },
    )
    const rows = await res.json().catch(() => null)
    const v = rows?.[0]?.value
    if (v?.token && typeof v.expiresAt === 'number') return v
  } catch {
    /* 캐시 실패는 발급으로 폴백 */
  }
  return null
}

async function dbSaveToken(v: { token: string; expiresAt: number }): Promise<void> {
  if (!SB_URL || !SB_SVC) return
  try {
    await fetch(`${SB_URL}/rest/v1/app_cache`, {
      method: 'POST',
      headers: {
        apikey: SB_SVC,
        Authorization: `Bearer ${SB_SVC}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({ key: TOKEN_KEY, value: v, updated_at: new Date().toISOString() }),
      signal: AbortSignal.timeout(5_000),
    })
  } catch {
    /* 저장 실패해도 동작엔 지장 없음 */
  }
}

// ─── 앱 캐시 (범용 — app_cache 테이블, service role 전용) ───────────────────
async function cacheGet(key: string): Promise<unknown | null> {
  if (!SB_URL || !SB_SVC) return null
  try {
    const res = await fetch(`${SB_URL}/rest/v1/app_cache?key=eq.${encodeURIComponent(key)}&select=value`, {
      headers: { apikey: SB_SVC, Authorization: `Bearer ${SB_SVC}` },
      signal: AbortSignal.timeout(5_000),
    })
    const rows = await res.json().catch(() => null)
    return rows?.[0]?.value ?? null
  } catch {
    return null
  }
}

async function cacheSet(key: string, value: unknown): Promise<void> {
  if (!SB_URL || !SB_SVC) return
  try {
    await fetch(`${SB_URL}/rest/v1/app_cache`, {
      method: 'POST',
      headers: {
        apikey: SB_SVC,
        Authorization: `Bearer ${SB_SVC}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
      signal: AbortSignal.timeout(5_000),
    })
  } catch {
    /* 캐시 실패는 무시 */
  }
}

async function issueToken(): Promise<{ token: string; expiresAt: number } | null> {
  const res = await fetch(BASE + '/oauth2/tokenP', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grant_type: 'client_credentials', appkey: APP_KEY, appsecret: APP_SECRET }),
    signal: AbortSignal.timeout(10_000),
  })
  const data = await res.json().catch(() => null)
  if (!data?.access_token) return null
  const expiresIn = Number(data.expires_in) || 86_400
  return { token: data.access_token, expiresAt: Date.now() + expiresIn * 1000 }
}

const fresh = (t: { token: string; expiresAt: number }) => t.token && t.expiresAt - 600_000 > Date.now()

async function getToken(force = false): Promise<string | null> {
  if (!APP_KEY || !APP_SECRET) return null
  if (!force) {
    if (fresh(tokenCache)) return tokenCache.token
    const db = await dbLoadToken()
    if (db && fresh(db)) {
      tokenCache = db
      return db.token
    }
  }
  let issued = await issueToken()
  if (!issued) {
    // 발급 빈도 제한(분당 1회)·순간 오류 — 잠시 후 1회 재시도
    await new Promise((r) => setTimeout(r, 1200))
    issued = await issueToken()
  }
  if (!issued) return null
  tokenCache = issued
  await dbSaveToken(issued)
  return issued.token
}

async function kisGet(path: string, trId: string, query: Record<string, string>) {
  let token = await getToken()
  if (!token) {
    return { ok: false, data: { error: APP_KEY ? 'kis-token-unavailable' : 'kis-not-configured' } }
  }
  const call = (tk: string) =>
    fetch(BASE + path + '?' + new URLSearchParams(query).toString(), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        authorization: 'Bearer ' + tk,
        appkey: APP_KEY,
        appsecret: APP_SECRET,
        tr_id: trId,
        custtype: 'P',
      },
      signal: AbortSignal.timeout(10_000),
    })
  let res = await call(token)
  if (res.status === 401) {
    // 저장된 토큰이 무효 — 강제 재발급 (DB 캐시 무시)
    tokenCache = { token: '', expiresAt: 0 }
    token = await getToken(true)
    if (token) res = await call(token)
  }
  const data = await res.json().catch(() => ({}))
  if (data?.rt_cd && data.rt_cd !== '0') return { ok: false, data }
  return { ok: res.ok, data }
}

// ─── 심볼 헬퍼 ──────────────────────────────────────────────────────────────
const isKr = (s: string) => /^\d{6}$/.test(s)

function usExcd(sym: string): string {
  const nas = new Set(['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'META', 'AMD'])
  if (nas.has(sym)) return 'NAS'
  return sym.length <= 3 ? 'NYS' : 'NAS'
}

function num(v: unknown): number {
  const n = Number(String(v ?? '').replace(/[^0-9.+-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function kstYmd(offsetDays: number): string {
  return new Date(Date.now() + 9 * 3_600_000 - offsetDays * 86_400_000)
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '')
}

// ─── 현재가 ─────────────────────────────────────────────────────────────────
async function quoteOf(sym: string) {
  if (isKr(sym)) {
    const r = await kisGet('/uapi/domestic-stock/v1/quotations/inquire-price', 'FHKST01010100', {
      FID_COND_MRKT_DIV_CODE: 'J',
      FID_INPUT_ISCD: sym,
    })
    const o = (r.data as { output?: Record<string, unknown> })?.output
    const price = num(o?.stck_prpr)
    if (!(price > 0)) return null
    return {
      price,
      changePercent: num(o?.prdy_ctrt),
      previousClose: price - num(o?.prdy_vrss),
      currency: 'KRW',
      source: 'kis',
    }
  }
  const r = await kisGet('/uapi/overseas-price/v1/quotations/price', 'HHDFS00000300', {
    AUTH: '',
    EXCD: usExcd(sym),
    SYMB: sym,
  })
  const o = (r.data as { output?: Record<string, unknown> })?.output
  const price = num(o?.last)
  if (!(price > 0)) return null
  const base = num(o?.base) // 전일 종가
  return {
    price,
    changePercent: base > 0 ? ((price - base) / base) * 100 : num(o?.rate),
    previousClose: base,
    currency: 'USD',
    source: 'kis',
  }
}

// ─── 일봉 ───────────────────────────────────────────────────────────────────
function dayCandle(dateRaw: unknown, closeRaw: unknown) {
  const date = String(dateRaw ?? '').replace(/\D/g, '')
  const close = num(closeRaw)
  if (date.length !== 8 || !(close > 0)) return null
  const d = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`
  // 12:00 KST = 03:00 UTC — 날짜 라벨용 대표 시각
  const time = Math.floor(Date.UTC(+date.slice(0, 4), +date.slice(4, 6) - 1, +date.slice(6, 8), 3) / 1000)
  return { time, close, d }
}

async function dailyCloses(sym: string, limit: number) {
  const range = {
    FID_INPUT_DATE_1: kstYmd(200),
    FID_INPUT_DATE_2: kstYmd(0),
    FID_PERIOD_DIV_CODE: 'D',
  }
  const r = isKr(sym)
    ? await kisGet('/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice', 'FHKST03010100', {
        FID_COND_MRKT_DIV_CODE: 'J',
        FID_INPUT_ISCD: sym,
        FID_ORG_ADJ_PRC: '0',
        ...range,
      })
    : await kisGet('/uapi/overseas-price/v1/quotations/inquire-daily-chartprice', 'FHKST03030100', {
        FID_COND_MRKT_DIV_CODE: 'N',
        FID_INPUT_ISCD: sym,
        ...range,
      })
  if (!r.ok) return { candles: [], error: (r.data as { msg1?: string })?.msg1 || 'kis-error' }
  const rows = ((r.data as { output2?: unknown[] })?.output2 ?? []) as Record<string, unknown>[]
  const candles = rows
    .map((row) => dayCandle(row.stck_bsop_date ?? row.xymd, row.stck_clpr ?? row.ovrs_nmix_prpr ?? row.last ?? row.clos))
    .filter((c): c is NonNullable<typeof c> => !!c)
    .sort((a, b) => a.time - b.time)
  // output1 에 KIS 공식 종목명(hts_kor_isnm)이 온다 — 패널 라벨용
  const out1 = (r.data as { output1?: Record<string, unknown> })?.output1
  const name = String(out1?.hts_kor_isnm ?? '').trim()
  return { candles: candles.slice(-limit), ...(name ? { name } : {}) }
}

// ─── 뉴스 (Google News RSS — 공개 피드, 키 불필요) ──────────────────────────
interface NewsItem {
  title: string
  link: string
  pub: string
  source: string
}

async function fetchNewsItems(q: string, limit = 6): Promise<NewsItem[]> {
  try {
    const rss = await fetch(
      'https://news.google.com/rss/search?q=' + encodeURIComponent(q) + '&hl=ko&gl=KR&ceid=KR:ko',
      { signal: AbortSignal.timeout(10_000) },
    ).then((r) => r.text())
    const items: NewsItem[] = []
    const re = /<item>([\s\S]*?)<\/item>/g
    let m: RegExpExecArray | null
    while ((m = re.exec(rss)) && items.length < limit) {
      const block = m[1]
      const pick = (tag: string) => {
        const mm = block.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`))
        return (mm?.[1] ?? '').trim()
      }
      const title = pick('title')
      const link = pick('link')
      if (title && link) items.push({ title, link, pub: pick('pubDate'), source: pick('source') })
    }
    return items
  } catch {
    return []
  }
}

// ─── AI 브리핑 (Gemini — 요약·관련성 태깅만, 지시어 금지) ────────────────────
const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY') ?? ''

/** 매수/매도 지시·추천 표현 — AI 출력에서 걸러낸다 (제품 불변식) */
const DIRECTIVE =
  /(사세요|파세요|사라[!.\s]|팔아라|팔아요|매수\s*하|매도\s*하|매수\s*추천|매도\s*추천|추천주|추천합니다|추천해요|올인|풀매수|풀매도|손절하세요|익절하세요|지금\s*(사|팔)|무조건)/

interface BriefHead {
  tag: string
  title: string
  link: string
}

interface BriefOut {
  summary: string | null
  items: Array<{ tag: string; headline: string; link: string; rel: boolean }>
}

async function geminiBrief(labels: string[], heads: BriefHead[]): Promise<BriefOut | null> {
  const prompt =
    '너는 투자 기록 앱의 뉴스 브리핑 도우미야. 규칙을 반드시 지켜:\n' +
    '- 사실만 요약한다. 매수/매도/추천/전망·예측 표현은 절대 쓰지 않는다.\n' +
    '- 짧은 반말("~했어", "~일 수 있어")로 쓴다. 이모지 금지.\n\n' +
    `사용자 보유 종목: ${labels.join(', ') || '(없음)'}\n` +
    '오늘 헤드라인 (index: [태그] 제목):\n' +
    heads.map((h, i) => `${i}: [${h.tag}] ${h.title}`).join('\n') +
    '\n\nJSON 으로만 답해:\n' +
    '{"summary": "헤드라인 흐름을 사실 위주로 한 문장 (최대 90자)", "relevant": [보유 종목의 투자 근거에 영향을 줄 수 있는 헤드라인 index, 최대 3개]}'
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
        }),
        signal: AbortSignal.timeout(20_000),
      },
    )
    const data = await res.json().catch(() => null)
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return null
    const parsed = JSON.parse(text) as { summary?: unknown; relevant?: unknown }
    let summary = typeof parsed.summary === 'string' ? parsed.summary.trim().slice(0, 120) : null
    if (summary && DIRECTIVE.test(summary)) summary = null // 지시어 감지 → 폐기, 결정적 문구로 폴백
    const relevant = new Set(Array.isArray(parsed.relevant) ? parsed.relevant.map(Number) : [])
    return {
      summary,
      items: heads.map((h, i) => ({ tag: h.tag, headline: h.title, link: h.link, rel: relevant.has(i) })),
    }
  } catch {
    return null
  }
}

// ─── 라우트 ─────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  const url = new URL(req.url)
  const path = url.pathname

  try {
    if (path.endsWith('/health')) {
      return json({ ok: true, service: 'hold-prices', source: 'kis', configured: !!APP_KEY })
    }

    if (path.endsWith('/quotes')) {
      const symbols = (url.searchParams.get('symbols') || '')
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
        .slice(0, 10)
      if (!symbols.length) return json({ ok: false, error: 'symbols required', quotes: {} })
      if (!APP_KEY) return json({ ok: false, error: 'kis-not-configured', quotes: {} })
      const results = await Promise.all(symbols.map(async (s) => [s, await quoteOf(s)] as const))
      const quotes: Record<string, unknown> = {}
      for (const [s, q] of results) if (q) quotes[s] = q
      return json({ ok: Object.keys(quotes).length > 0, count: Object.keys(quotes).length, quotes }, 200, 30)
    }

    if (path.endsWith('/news')) {
      // 종목 뉴스 — 제목·링크·시각만 전달.
      const q = (url.searchParams.get('q') ?? '').slice(0, 60)
      if (!q) return json({ items: [] })
      return json({ items: await fetchNewsItems(q, 6) }, 200, 300)
    }

    if (path.endsWith('/brief')) {
      // AI 뉴스 브리핑 — 보유 종목 헤드라인 수집 → Gemini 요약(선택) → 30분 캐시.
      // GEMINI_API_KEY 미설정이면 헤드라인 + 결정적 문구만 반환 (앱은 그대로 동작).
      const labels = (url.searchParams.get('labels') ?? '')
        .split(',')
        .map((s) => s.trim().slice(0, 20))
        .filter(Boolean)
        .slice(0, 3)
      const ck = 'brief:' + (labels.join('|') || 'general')
      const hit = (await cacheGet(ck)) as { at: number; data: BriefOut } | null
      if (hit && typeof hit.at === 'number' && Date.now() - hit.at < 30 * 60_000 && hit.data) {
        return json({ ...hit.data, cached: true }, 200, 300)
      }
      const queries = [
        ...labels.map((l) => ({ tag: l, q: `${l} 주가` })),
        { tag: '시장', q: '코스피 증시' },
      ]
      const fetched = await Promise.all(queries.map(async (x) => (await fetchNewsItems(x.q, 5)).map((it) => ({ tag: x.tag, title: it.title, link: it.link }))))
      const seen = new Set<string>()
      const heads: BriefHead[] = fetched
        .flat()
        .filter((h) => {
          const k = h.title.slice(0, 40)
          if (seen.has(k)) return false
          seen.add(k)
          return true
        })
        .slice(0, 14)
      let out: BriefOut = {
        summary: null,
        items: heads.map((h) => ({ tag: h.tag, headline: h.title, link: h.link, rel: false })),
      }
      if (GEMINI_KEY && heads.length) {
        const g = await geminiBrief(labels, heads)
        if (g) out = g
      }
      if (!out.summary && heads.length) {
        // AI 없거나 실패 — 결정적 사실 문구
        const relN = out.items.filter((i) => i.rel).length
        out.summary = relN
          ? `오늘 관련 뉴스 ${heads.length}건 확인했어 — ${relN}건은 네 계획 근거와 연결될 수 있어.`
          : `오늘 관련 뉴스 ${heads.length}건 확인했어 — 판단은 네 계획 기준으로.`
      }
      await cacheSet(ck, { at: Date.now(), data: out })
      return json(out, 200, 300)
    }

    if (path.endsWith('/klines')) {
      const symbol = (url.searchParams.get('symbol') || '').trim().toUpperCase()
      const limit = Math.min(400, Number(url.searchParams.get('limit') || '60') || 60)
      if (!symbol) return json({ candles: [], error: 'symbol required' })
      if (!APP_KEY) return json({ candles: [], error: 'kis-not-configured' })
      return json({ ...(await dailyCloses(symbol, limit)), interval: 'D', source: 'kis' }, 200, 300)
    }

    return json({ error: 'not found', path }, 404)
  } catch (e) {
    return json({ ok: false, error: String((e as Error)?.message || e) })
  }
})
