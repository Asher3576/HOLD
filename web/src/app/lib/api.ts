/**
 * HOLD 시세 API — 자기 프로젝트의 prices 엣지 함수(스토커스클럽 토스증권 중계) 호출.
 * 함수가 아직 미배포거나 네트워크 실패면 null 을 반환하고, 호출부는 목데이터로 폴백한다.
 */
import type { PricePoint } from '../mock/prices'

export interface Quote {
  price: number
  changePercent: number | null
  previousClose: number
  currency: string
}

const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL ?? ''}/functions/v1/prices`
const KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? ''
const HEADERS: Record<string, string> = KEY
  ? { Authorization: `Bearer ${KEY}`, apikey: KEY }
  : {}

let warned = false
function warnOnce(reason: string) {
  if (warned) return
  warned = true
  console.info(`[HOLD] 실시세 연결 실패(${reason}) — 목데이터로 동작합니다. supabase functions deploy prices 후 자동으로 붙어요.`)
}

export async function fetchQuotes(codes: string[]): Promise<Record<string, Quote> | null> {
  try {
    const res = await fetch(`${FN_BASE}/quotes?symbols=${encodeURIComponent(codes.join(','))}`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) throw new Error(`http ${res.status}`)
    const data = await res.json()
    if (!data?.ok || !data.quotes || Object.keys(data.quotes).length === 0) {
      throw new Error(data?.error || 'empty quotes')
    }
    return data.quotes as Record<string, Quote>
  } catch (e) {
    warnOnce(String(e))
    return null
  }
}

const klinesCache = new Map<string, PricePoint[]>()

/** 일봉 종가 → 차트 포인트. 실패 시 null (호출부 목데이터 폴백). */
export async function fetchDailyCloses(code: string, limit = 60): Promise<PricePoint[] | null> {
  const hit = klinesCache.get(code)
  if (hit) return hit
  try {
    const res = await fetch(`${FN_BASE}/klines?symbol=${encodeURIComponent(code)}&limit=${limit}`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) throw new Error(`http ${res.status}`)
    const data = await res.json()
    const candles: Array<{ time: number; close: number; d?: string }> = data?.candles ?? []
    if (!candles.length) throw new Error(data?.error || 'empty candles')
    const points: PricePoint[] = candles
      .map((c) => ({
        // d = 토스 1d 소스의 KST 거래일 라벨. 없으면 epoch(sec) → 날짜.
        time: c.d ?? new Date(c.time * 1000).toISOString().slice(0, 10),
        value: c.close,
      }))
      .filter((p) => Number.isFinite(p.value) && p.value > 0)
    if (!points.length) throw new Error('no valid closes')
    klinesCache.set(code, points)
    return points
  } catch (e) {
    warnOnce(String(e))
    return null
  }
}
