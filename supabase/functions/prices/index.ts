// HOLD 시세 프록시 — 스토커스클럽 엣지(토스증권 Open API 래퍼)를 서버-서버로 중계.
// 토스 OAuth 키는 전부 스토커스클럽 프로젝트에 있음 — HOLD 시크릿 불필요 (anon 키는 공개 키).
// 배포: 대시보드 에디터 또는 supabase functions deploy prices --no-verify-jwt
//
// 라우트:
//   GET /prices/health
//   GET /prices/quotes?symbols=005930,000660
//   GET /prices/klines?symbol=005930&limit=60

const SC_BASE = 'https://pxnssobmgzbegmmitsyd.supabase.co/functions/v1/make-server-753da50e'
const SC_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4bnNzb2JtZ3piZWdtbWl0c3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NjExMjAsImV4cCI6MjA4NjAzNzEyMH0.FOnq4xOhVQa-f4UDkMYznBmDXNqD0StXS4Pp30A1SGA'

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

// 업스트림 응답이 JSON 이 아니어도 죽지 않게 텍스트로 받고 안전 파싱 + 상태 노출
async function upstream(path: string) {
  const res = await fetch(SC_BASE + path, {
    headers: { Authorization: 'Bearer ' + SC_ANON },
    signal: AbortSignal.timeout(12_000),
  })
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return { ok: false, upstreamStatus: res.status, body: text.slice(0, 200) }
  }
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
      const symbols = url.searchParams.get('symbols') || ''
      if (!symbols) return json({ ok: false, error: 'symbols required', quotes: {} })
      return json(await upstream('/stock/quotes-batch?symbols=' + encodeURIComponent(symbols)), 200, 30)
    }

    if (path.endsWith('/klines')) {
      const symbol = url.searchParams.get('symbol') || ''
      const limit = Math.min(400, Number(url.searchParams.get('limit') || '60') || 60)
      if (!symbol) return json({ candles: [], error: 'symbol required' })
      return json(
        await upstream('/stock/klines?symbol=' + encodeURIComponent(symbol) + '&interval=D&limit=' + limit),
        200,
        300,
      )
    }

    return json({ error: 'not found', path }, 404)
  } catch (e) {
    return json({ ok: false, error: String((e as Error)?.message || e) })
  }
})
