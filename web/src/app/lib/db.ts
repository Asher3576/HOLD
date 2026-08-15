/**
 * Phase B — Supabase 영속 레이어.
 * 모든 함수는 던지지 않는다(실패 시 null/false + console.warn) — 네트워크가 죽어도 앱은 동작.
 * 규칙: 주문·API키 없음. plans/held_records/reviews/paper_accounts 만 읽고 쓴다.
 */
import { supabase } from './supabase'
import type { Egg, Fruit } from '../model'
import { SEED_CASH } from '../model'

interface PlanRow {
  id: string
  symbol: string
  symbol_name: string | null
  entry_price: number | null
  quantity: number | null
  stop_pct: number
  take_pct: number
  horizon_days: number
  reason: string
  status: string
  created_at: string
  ended_at: string | null
  dismissed_at: string | null
}

function warn(op: string, e: unknown) {
  console.warn(`[HOLD db] ${op} 실패:`, e)
}

/** 계좌 로드 (없으면 시드 현금으로 생성) */
export async function ensureAccount(uid: string): Promise<{ cash: number } | null> {
  if (!supabase) return null
  try {
    const { data } = await supabase.from('paper_accounts').select('cash').eq('user_id', uid).maybeSingle()
    if (data) return { cash: Number(data.cash) }
    const { error } = await supabase.from('paper_accounts').insert({ user_id: uid, cash: SEED_CASH })
    if (error) throw error
    return { cash: SEED_CASH }
  } catch (e) {
    warn('ensureAccount', e)
    return null
  }
}

export async function saveCash(uid: string, cash: number): Promise<void> {
  if (!supabase) return
  try {
    await supabase.from('paper_accounts').update({ cash, updated_at: new Date().toISOString() }).eq('user_id', uid)
  } catch (e) {
    warn('saveCash', e)
  }
}

/** 부화 이력: symbol_name → 완주(hatched) 횟수 */
export async function fetchHatchedMap(uid: string): Promise<Record<string, number>> {
  if (!supabase) return {}
  try {
    const { data } = await supabase
      .from('plans')
      .select('symbol_name')
      .eq('user_id', uid)
      .eq('status', 'hatched')
    const map: Record<string, number> = {}
    for (const r of data ?? []) {
      const n = (r.symbol_name as string) || ''
      if (n) map[n] = (map[n] || 0) + 1
    }
    return map
  } catch (e) {
    warn('fetchHatchedMap', e)
    return {}
  }
}

function rowToEgg(row: PlanRow, hatchedMap: Record<string, number>): Egg {
  const lv = hatchedMap[row.symbol_name ?? ''] || 0
  const created = new Date(row.created_at).getTime()
  const elapsed = Math.max(0, Math.floor((Date.now() - created) / 86_400_000))
  const expired = row.status === 'active' && elapsed >= row.horizon_days
  const stage: Egg['stage'] =
    row.status === 'stopped' ? 'shield' : expired ? 'expiry' : lv > 0 ? 'creature' : 'plain'
  const stop = Number(row.stop_pct)
  const take = Number(row.take_pct)
  const dateLabel = new Date(created).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
  return {
    id: row.id,
    name: row.symbol_name || row.symbol,
    code: row.symbol,
    qty: row.quantity ? `${Number(row.quantity)}주` : '',
    qtyN: row.quantity ? Number(row.quantity) : undefined,
    entry: row.entry_price ? Number(row.entry_price) : undefined,
    stop,
    target: take,
    days: row.horizon_days,
    elapsed,
    prog: stop + take > 0 ? Math.round((stop / (stop + take)) * 100) : 50,
    stage,
    lv,
    reason: row.reason,
    memoL: `${dateLabel}의 너`,
    memoQ: row.reason,
    real: true,
  }
}

/** 선반에 보일 계획: active + (정리 안 한) stopped */
export async function fetchEggs(uid: string, hatchedMap: Record<string, number>): Promise<Egg[] | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('user_id', uid)
      .in('status', ['active', 'stopped'])
      .is('dismissed_at', null)
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data as PlanRow[]).map((r) => rowToEgg(r, hatchedMap))
  } catch (e) {
    warn('fetchEggs', e)
    return null
  }
}

export async function createPlan(
  uid: string,
  p: { symbol: string; name: string; entry: number; qty: number; stop: number; take: number; days: number; reason: string },
): Promise<string | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('plans')
      .insert({
        user_id: uid,
        symbol: p.symbol,
        symbol_name: p.name,
        entry_price: p.entry,
        quantity: p.qty,
        stop_pct: p.stop,
        take_pct: p.take,
        horizon_days: p.days,
        reason: p.reason,
        origin_stop_pct: p.stop,
        origin_take_pct: p.take,
        origin_horizon_days: p.days,
      })
      .select('id')
      .single()
    if (error) throw error
    return data.id as string
  } catch (e) {
    warn('createPlan', e)
    return null
  }
}

export async function endPlan(planId: string, status: 'hatched' | 'stopped' | 'sold_early' | 'expired'): Promise<void> {
  if (!supabase) return
  try {
    await supabase.from('plans').update({ status, ended_at: new Date().toISOString() }).eq('id', planId)
  } catch (e) {
    warn('endPlan', e)
  }
}

export async function dismissPlan(planId: string): Promise<void> {
  if (!supabase) return
  try {
    await supabase.from('plans').update({ dismissed_at: new Date().toISOString() }).eq('id', planId)
  } catch (e) {
    warn('dismissPlan', e)
  }
}

export async function insertHeldRecord(
  uid: string,
  planId: string,
  kind: 'hold_sell' | 'hold_buy',
  priceAt: number,
): Promise<void> {
  if (!supabase) return
  try {
    await supabase.from('held_records').insert({ user_id: uid, plan_id: planId, kind, price_at: priceAt })
  } catch (e) {
    warn('insertHeldRecord', e)
  }
}

interface HeldRow {
  id: string
  plan_id: string
  kind: string
  price_at: number
  outcome_pct: number | null
  created_at: string
  plans: { symbol_name: string | null; symbol: string } | null
}

export interface RealFruits {
  fruits: Fruit[]
  total: number
  /** 채점 대기 중(30일 경과)인 레코드 — [id, symbol, price_at, kind] */
  pending: Array<{ id: string; symbol: string; priceAt: number; kind: string }>
}

export async function fetchFruits(uid: string): Promise<RealFruits | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('held_records')
      .select('id, plan_id, kind, price_at, outcome_pct, created_at, plans(symbol_name, symbol)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(30)
    if (error) throw error
    const rows = (data ?? []) as unknown as HeldRow[]
    const fruits: Fruit[] = []
    const pending: RealFruits['pending'] = []
    for (const r of rows) {
      const name = r.plans?.symbol_name || r.plans?.symbol || ''
      const ageDays = Math.floor((Date.now() - new Date(r.created_at).getTime()) / 86_400_000)
      if (r.outcome_pct == null) {
        if (ageDays >= 30 && r.plans?.symbol) {
          pending.push({ id: r.id, symbol: r.plans.symbol, priceAt: Number(r.price_at), kind: r.kind })
        }
        fruits.push({ name, kind: 'pend', dir: `D-${Math.max(0, 30 - ageDays)}`, note: '30일 뒤 판명' })
        continue
      }
      const up = r.outcome_pct >= 0
      // hold_sell: 참고 안 팔았는데 올랐으면 잘 참은 것(ripe). hold_buy: 참고 안 샀는데 내렸으면 ripe.
      const good = r.kind === 'hold_sell' ? up : !up
      fruits.push({
        name,
        kind: good ? 'ripe' : 'wilt',
        dir: `30일 뒤 ${up ? '상승' : '하락'}`,
        note: good ? (r.kind === 'hold_buy' ? '안 사길 잘했어' : '참길 잘했어') : '이번엔 반대였네',
      })
    }
    return { fruits, total: rows.length, pending }
  } catch (e) {
    warn('fetchFruits', e)
    return null
  }
}

/**
 * 열매 채점 (MVP): 30일 경과한 참은 기록을 현재가 기준으로 확정.
 * 정확한 "30일 시점 가격" 채점은 candles 적재 + 크론(Phase C 잔여)에서 대체 예정.
 */
export async function scorePending(
  pending: RealFruits['pending'],
  priceOf: (symbol: string) => number | undefined,
): Promise<number> {
  if (!supabase || !pending.length) return 0
  let scored = 0
  for (const p of pending) {
    const now = priceOf(p.symbol)
    if (!now || !(p.priceAt > 0)) continue
    const outcome = ((now - p.priceAt) / p.priceAt) * 100
    try {
      await supabase.from('held_records').update({ outcome_pct: Math.round(outcome * 10) / 10 }).eq('id', p.id)
      scored++
    } catch (e) {
      warn('scorePending', e)
    }
  }
  return scored
}

export async function insertReview(
  uid: string,
  planId: string,
  tags: { trigger: string; thesis: string; emotion: string },
): Promise<void> {
  if (!supabase) return
  try {
    await supabase.from('reviews').insert({
      user_id: uid,
      plan_id: planId,
      trigger_tag: tags.trigger,
      thesis_state: tags.thesis,
      emotion_tag: tags.emotion,
    })
  } catch (e) {
    warn('insertReview', e)
  }
}

/** 완주율: 끝난 계획 중 hatched 비율 (%) */
export async function fetchHatchStats(uid: string): Promise<{ hatchN: number; hatchRate: number }> {
  if (!supabase) return { hatchN: 0, hatchRate: 0 }
  try {
    const { data } = await supabase
      .from('plans')
      .select('status')
      .eq('user_id', uid)
      .in('status', ['hatched', 'stopped', 'sold_early', 'expired'])
    const rows = data ?? []
    const hatchN = rows.filter((r) => r.status === 'hatched').length
    return { hatchN, hatchRate: rows.length ? Math.round((hatchN / rows.length) * 100) : 0 }
  } catch (e) {
    warn('fetchHatchStats', e)
    return { hatchN: 0, hatchRate: 0 }
  }
}
