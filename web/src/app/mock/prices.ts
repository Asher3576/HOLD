import type { Egg } from '../model'

/**
 * 알 상세 차트용 목 일봉 시세.
 * 시드 랜덤워크를 만들고 양 끝점을 브리지 보정:
 * 시작 = 진입가, 끝 = 손절가 + 진행률 × (익절가 − 손절가) — 게이지 진행률과 일치.
 */

export const ENTRY: Record<string, number> = {
  삼성전자: 70_000,
  SK하이닉스: 180_000,
  NAVER: 195_000,
  카카오: 48_000,
  LG에너지솔루션: 420_000,
}

export interface PricePoint {
  time: string // yyyy-mm-dd
  value: number
}

export interface EggChart {
  data: PricePoint[]
  entry: number
  stopPrice?: number
  takePrice?: number
}

/** 종목명 → 결정적 시드 (렌더마다 같은 차트) */
function seedOf(name: string): number {
  let h = 2166136261
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function lcg(seed: number): () => number {
  let x = seed || 1
  return () => {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0
    return x / 4294967296
  }
}

function dateStr(startMs: number, i: number): string {
  const d = new Date(startMs + i * 86_400_000)
  return d.toISOString().slice(0, 10)
}

const START_MS = Date.UTC(2025, 5, 20) // 2025-06-20 고정 (결정적)
const POINTS = 40

export function eggChart(egg: Egg): EggChart {
  const entry = egg.entry ?? ENTRY[egg.name] ?? 10_000
  const planned = egg.stop != null && egg.target != null && egg.stage !== 'wild'
  const stopPrice = planned ? entry * (1 - (egg.stop as number) / 100) : undefined
  const takePrice = planned ? entry * (1 + (egg.target as number) / 100) : undefined

  // 랜덤워크
  const rnd = lcg(seedOf(egg.name))
  const vol = entry * 0.011
  const walk: number[] = [entry]
  for (let i = 1; i < POINTS; i++) {
    walk.push(walk[i - 1] + (rnd() - 0.5) * 2 * vol)
  }

  // 끝점 목표: 게이지 진행률과 일치하는 현재가 (야생알은 워크 그대로)
  const endTarget =
    planned && stopPrice != null && takePrice != null
      ? stopPrice + ((egg.prog ?? 50) / 100) * (takePrice - stopPrice)
      : walk[POINTS - 1]

  const w0 = walk[0]
  const wEnd = walk[POINTS - 1]
  const data: PricePoint[] = walk.map((w, i) => {
    const t = i / (POINTS - 1)
    let v = w + (entry - w0) * (1 - t) + (endTarget - wEnd) * t
    if (stopPrice != null && takePrice != null) {
      const lo = stopPrice * 0.985
      const hi = takePrice * 1.015
      v = Math.max(lo, Math.min(hi, v))
    }
    return { time: dateStr(START_MS, i), value: Math.round(v) }
  })

  return { data, entry, stopPrice, takePrice }
}
