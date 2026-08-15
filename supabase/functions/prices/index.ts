// HOLD 시세 프록시 — 스토커스클럽 엣지(토스증권 Open API 래퍼)를 서버-서버로 중계.
//
// 왜 프록시인가: 스토커스클럽 엣지의 CORS 는 stockersclub.com 계열 Origin 만
// 반사한다(fail-closed). HOLD 브라우저가 직접 부르면 차단되므로, 이 함수가
// 서버-서버(CORS 무관)로 대신 호출하고 HOLD 쪽엔 개방 CORS 로 응답한다.
// 토스 OAuth/IP 화이트리스트는 전부 스토커스클럽 쪽에 있음 — 여기엔 시크릿 없음
// (anon key 는 공개 키). 필요 시 STOCKERS_EDGE_BASE/STOCKERS_ANON_KEY 로 교체.
//
// 배포: supabase functions deploy prices --no-verify-jwt
//
// 라우트:
//   GET /prices/health
//   GET /prices/quotes?symbols=005930,000660   → {ok, quotes:{code:{price,changePercent,previousClose,currency}}}
//   GET /prices/klines?symbol=005930&limit=60  → {candles:[{time,open,high,low,close,volume,d?}], source}

const SC_BASE =
  Deno.env.get('STOCKERS_EDGE_BASE') ??
  'https://pxnssobmgzbegmmitsyd.supabase.co/functions/v1/make-server-753da50e'
const SC_ANON =
  Deno.env.get('STOCKERS_ANON_KEY') ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4bnNzb2JtZ3piZWdtbWl0c3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NjExMjAsImV4cCI6MjA4NjAzNzEyMH0.FOnq4xOhVQa-f4UDkMYznBmDXNqD0StXS4Pp30A1SGA'

const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

function json(body: unknown, status = 200, sMaxAge = 0): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS,
      'Content-Type': 'application/json',
      ...(sMaxAge > 0 ? { 'Cache-Control': `public, s-maxage=${sMaxAge}` } : {}),
    },
  })
}

async function upstream(path: string): Promise<unknown> {
  const res = await fetch(`${SC_BASE}${path}`, {
    headers: { Authorization: `Bearer ${SC_ANON}` },
    signal: AbortSignal.timeout(12_000),
  })
  return await res.json()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  const url = new URL(req.url)
  const path = url.pathname

  try {
    if (path.endsWith('/health')) {
      return json({ ok: true, service: 'hold-prices' })
    }

    if (path.endsWith('/quotes')) {
      const symbols = (url.searchParams.get('symbols') ?? '').slice(0, 300)
      if (!symbols) return json({ ok: false, error: 'symbols required', quotes: {} })
      const data = await upstream(
        `/stock/quotes-batch?symbols=${encodeURIComponent(symbols)}`,
      )
      return json(data, 200, 30) // 30초 엣지 캐시 — 지연시세라 충분
    }

    if (path.endsWith('/klines')) {
      const symbol = (url.searchParams.get('symbol') ?? '').slice(0, 20)
      const limit = Math.min(400, Number(url.searchParams.get('limit') ?? '60') || 60)
      if (!symbol) return json({ candles: [], error: 'symbol required' })
      const data = await upstream(
        `/stock/klines?symbol=${encodeURIComponent(symbol)}&interval=D&limit=${limit}`,
      )
      return json(data, 200, 300) // 일봉은 5분 캐시
    }

    return json({ error: 'not found' }, 404)
  } catch (e) {
    return json({ ok: false, error: String(e) })
  }
})
