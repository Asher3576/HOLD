/**
 * HOLD 중앙 상태 훅 — v5 디자인의 인터랙션 로직 포트.
 * 금고 마찰(길게 누르기 다이얼), 시트 4종, 매도 카운트다운, 알 생성/부화,
 * 복기 3턴, 확장 데모 시퀀스 + 손익비 핸들 드래그.
 */
import { useEffect, useRef, useState } from 'react'
import type { Egg, Fruit, PlanMode, SheetKind, VaultPhase } from './model'
import { DIAL_BASE, DIAL_STEP, SEED_CASH, SELL_COUNTDOWN, SYMBOL_CODE } from './model'
import { initialEggs, initialHatchedMap } from './mock/design'
import { ENTRY } from './mock/prices'
import { fetchQuotes, type Quote } from './lib/api'
import { fmtWon } from './ui'
import { y2p } from './ext/chartMath'

/**
 * 실시세 수신 → 현재가 반영 + 목 진입가를 실가격 기준으로 리베이스.
 * 목 진입가(7만 삼성전자 등)와 실제 주가의 괴리로 진행률이 0/100에 붙는 것을 막기 위해,
 * "설계된 진행률(prog)이 현재 실가격 위치가 되도록" 진입가를 역산한다.
 *   price = entry × (1 − stop% + prog × (stop%+target%))  →  entry 역산
 * 이후 평가손익 = Σ 수량 × (현재가 − 진입가) 로 일관.
 */
function applyQuotes(eggs: Egg[], quotes: Record<string, Quote>): Egg[] {
  return eggs.map((g) => {
    const q = g.code ? quotes[g.code] : undefined
    if (!q || !Number.isFinite(q.price) || q.price <= 0) return g
    const next: Egg = { ...g, price: q.price }
    const planned =
      g.stop != null && g.target != null &&
      (g.stage === 'plain' || g.stage === 'crack' || g.stage === 'creature' || g.stage === 'expiry')
    if (planned) {
      const s = g.stop! / 100
      const t = g.target! / 100
      const p = (g.prog ?? 50) / 100
      const denom = 1 - s + p * (s + t)
      if (denom > 0) next.entry = Math.round(q.price / denom)
    } else if (next.entry == null) {
      next.entry = q.price // 야생알 — 기준가 없으면 현재가
    }
    return next
  })
}

export interface HoldState {
  surf: 'web' | 'ext'
  vaultPhase: VaultPhase
  dialDur: number
  openCount: number
  /** 모의 계좌 현금 (임의 시드) */
  cash: number
  /** 실시세 (code → quote). 비어 있으면 목데이터 모드 */
  quotes: Record<string, Quote>
  live: boolean
  /** 새 알 품기 — 모의 매수 수량 */
  pQty: number
  newsOpen: boolean
  celebrating: boolean
  flyOn: boolean
  eggs: Egg[]
  hatch5: boolean
  hatchN: number
  hatchRate: number
  hatchedMap: Record<string, number>
  fruitsExtra: Fruit[]
  fruitTotal: number
  sheet: SheetKind | null
  sheetEgg: string | null
  justAdded: string | null
  changing: boolean
  cd: number | null
  changeReason: string
  pMode: PlanMode
  pName: string
  pStop: number
  pTarget: number
  pDays: number
  pReason: string
  pAi: 'applied' | 'kept' | null
  rvStep: number
  rvA1: string | null
  rvA2: string | null
  extStep: number
  hEntry: number
  hStop: number
  hTarget: number
  toast: string | null
}

const initial: HoldState = {
  surf: 'web',
  vaultPhase: 'rest',
  dialDur: 1.9,
  openCount: 2,
  cash: SEED_CASH,
  quotes: {},
  live: false,
  pQty: 10,
  newsOpen: false,
  celebrating: false,
  flyOn: false,
  eggs: initialEggs,
  hatch5: false,
  hatchN: 4,
  hatchRate: 33,
  hatchedMap: initialHatchedMap,
  fruitsExtra: [],
  fruitTotal: 12,
  sheet: null,
  sheetEgg: null,
  justAdded: null,
  changing: false,
  cd: null,
  changeReason: '',
  pMode: 'new',
  pName: '',
  pStop: 3,
  pTarget: 12,
  pDays: 30,
  pReason: '',
  pAi: null,
  rvStep: 0,
  rvA1: null,
  rvA2: null,
  extStep: 0,
  hEntry: 235.6,
  hStop: 228.0,
  hTarget: 253.0,
  toast: null,
}

type Patch = Partial<HoldState> | ((s: HoldState) => Partial<HoldState>)

export function useHold() {
  const [s, setAll] = useState<HoldState>(initial)
  const sRef = useRef(s)
  sRef.current = s

  const set = (patch: Patch) =>
    setAll((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }))

  // 타이머
  const dialT = useRef<number>()
  const closeT = useRef<number>()
  const cdI = useRef<number>()
  const toastT = useRef<number>()
  const celebT = useRef<number>()
  const flyT = useRef<number>()
  const extT = useRef<number[]>([])

  const chartRef = useRef<HTMLDivElement>(null)
  const dragK = useRef<'e' | 's' | 't' | null>(null)
  const chartRect = useRef<DOMRect | null>(null)

  useEffect(
    () => () => {
      clearTimeout(dialT.current)
      clearTimeout(closeT.current)
      clearInterval(cdI.current)
      clearTimeout(toastT.current)
      clearTimeout(celebT.current)
      clearTimeout(flyT.current)
      extT.current.forEach(clearTimeout)
    },
    [],
  )

  // 실시세 로드 (토스증권 → 스토커스클럽 엣지 → HOLD prices 프록시). 실패 시 목데이터 유지.
  useEffect(() => {
    let on = true
    const codes = Array.from(
      new Set(
        sRef.current.eggs.map((g) => g.code).filter((c): c is string => !!c),
      ),
    )
    if (!codes.length) return
    fetchQuotes(codes).then((quotes) => {
      if (!on || !quotes) return
      set((st) => ({ quotes, live: true, eggs: applyQuotes(st.eggs, quotes) }))
    })
    return () => {
      on = false
    }
  }, [])

  /** 종목명 기준 모의 체결가: 실시세 → 목 진입가 → 10,000원 */
  const execPrice = (name: string): number => {
    const code = SYMBOL_CODE[name]
    const q = code ? sRef.current.quotes[code] : undefined
    if (q && Number.isFinite(q.price) && q.price > 0) return q.price
    return ENTRY[name] ?? 10_000
  }
  /** 알의 현재 평가 단가 */
  const eggPrice = (g: Egg): number => g.price ?? g.entry ?? ENTRY[g.name] ?? 0

  const showToast = (msg: string) => {
    clearTimeout(toastT.current)
    set({ toast: msg })
    toastT.current = window.setTimeout(() => set({ toast: null }), 4400)
  }

  const celebrate = () => {
    clearTimeout(celebT.current)
    set({ celebrating: true })
    celebT.current = window.setTimeout(() => set({ celebrating: false }), 2600)
  }

  // ─── 금고 ──────────────────────────────────────────────────────────────
  const vaultDown = (e: React.PointerEvent) => {
    e.preventDefault()
    if (sRef.current.vaultPhase !== 'rest') return
    const dur = Math.round((DIAL_BASE + (sRef.current.openCount + 1) * DIAL_STEP) * 10) / 10
    set({ vaultPhase: 'dialing', dialDur: dur })
    dialT.current = window.setTimeout(() => {
      set((st) => ({ vaultPhase: 'open', openCount: st.openCount + 1 }))
    }, dur * 1000)
  }
  const vaultUp = () => {
    const ph = sRef.current.vaultPhase
    if (ph === 'dialing') {
      clearTimeout(dialT.current)
      set({ vaultPhase: 'rest' })
    } else if (ph === 'open') {
      set({ vaultPhase: 'closing' })
      closeT.current = window.setTimeout(() => set({ vaultPhase: 'rest' }), 380)
    }
  }

  // ─── 시트 ──────────────────────────────────────────────────────────────
  const openEgg = (id: string) => set({ sheet: 'detail', sheetEgg: id })
  const openSell = () => set({ sheet: 'sell', changing: false, cd: null, changeReason: '' })
  const openPlan = (mode: PlanMode, eggId?: string | null, pre?: { name?: string; stop?: number; target?: number }) =>
    set({
      sheet: 'plan',
      pMode: mode,
      sheetEgg: eggId ?? null,
      pName: pre?.name ?? '',
      pStop: pre?.stop ?? 3,
      pTarget: pre?.target ?? 12,
      pDays: 30,
      pQty: 10,
      pReason: '',
      pAi: null,
      surf: 'web',
    })
  const openReview = () =>
    set((st) => ({
      sheet: 'review',
      rvStep: st.rvA2 ? 2 : 0,
      rvA1: st.rvA2 ? st.rvA1 : null,
      rvA2: st.rvA2 ?? null,
    }))
  const closeSheet = () => {
    clearInterval(cdI.current)
    set({ sheet: null, changing: false, cd: null })
  }

  // ─── 매도 개입 ─────────────────────────────────────────────────────────
  const waitHold = () => {
    const st = sRef.current
    const egg = st.eggs.find((g) => g.id === st.sheetEgg)
    const n = st.fruitTotal + 1
    clearTimeout(flyT.current)
    set((prev) => ({
      sheet: null,
      changing: false,
      cd: null,
      flyOn: true,
      fruitTotal: n,
      fruitsExtra: [
        { name: egg?.name ?? '', kind: 'pend', dir: 'D-30', note: '30일 뒤 판명' },
        ...prev.fruitsExtra,
      ],
    }))
    celebrate()
    flyT.current = window.setTimeout(() => set({ flyOn: false }), 950)
    showToast(`${n}번째 열매야. 30일 뒤에 어떻게 익었는지 알려줄게`)
  }

  const startChange = () => {
    set({ changing: true, cd: SELL_COUNTDOWN })
    clearInterval(cdI.current)
    cdI.current = window.setInterval(() => {
      set((st) => {
        if (st.cd === null) return {}
        if (st.cd <= 1) {
          clearInterval(cdI.current)
          return { cd: 0 }
        }
        return { cd: st.cd - 1 }
      })
    }, 1000)
  }
  const cancelChange = () => {
    clearInterval(cdI.current)
    set({ changing: false, cd: null, changeReason: '' })
  }
  const confirmPull = () => {
    const st = sRef.current
    const egg = st.eggs.find((g) => g.id === st.sheetEgg)
    clearInterval(cdI.current)
    const proceeds = egg?.qtyN ? egg.qtyN * eggPrice(egg) : 0
    set((prev) => ({
      eggs: prev.eggs.filter((g) => g.id !== prev.sheetEgg),
      cash: prev.cash + proceeds,
      sheet: null,
      changing: false,
      cd: null,
      changeReason: '',
    }))
    showToast(
      (egg ? `${egg.name} ${egg.qty} 모의 매도 체결 · ${fmtWon(proceeds)} 회수` : '모의 매도 체결') +
        (egg?.stage === 'creature' ? ' — 사육 중단' : '') +
        '. 실거래는 없어 — 이유는 적어뒀어.',
    )
  }

  // ─── 계획(알 만들기) ────────────────────────────────────────────────────
  const adj = (key: 'pStop' | 'pTarget' | 'pDays' | 'pQty', d: number, min: number, max: number) =>
    set((st) => ({ [key]: Math.max(min, Math.min(max, st[key] + d)) }) as Partial<HoldState>)

  const applySug = () => set({ pAi: 'applied', pStop: 7 })
  const keepPlan = () => set({ pAi: 'kept' })

  const submitPlan = () => {
    const st = sRef.current
    // 계획 기준가 = 계획 시작 시점 체결/현재가 (실시세 우선)
    const mk = (id: string, name: string, qtyN: number, entryPrice: number): Egg => {
      const lv = st.hatchedMap[name] || 0
      return {
        id,
        name,
        qty: `${qtyN}주`,
        qtyN,
        code: SYMBOL_CODE[name],
        entry: entryPrice,
        price: entryPrice,
        stop: st.pStop,
        target: st.pTarget,
        days: st.pDays,
        elapsed: 0,
        prog: Math.round((st.pStop / (st.pStop + st.pTarget)) * 100),
        stage: lv > 0 ? 'creature' : 'plain',
        lv,
        reason: st.pReason,
        memoL: '오늘의 너',
        memoQ: st.pReason,
      }
    }
    if (st.pMode === 'wild') {
      // 이미 보유 중인 야생알에 계획만 붙임 — 매수 없음
      set((prev) => ({
        eggs: prev.eggs.map((g) => (g.id === 'nv' ? mk('nv', 'NAVER', g.qtyN ?? 10, execPrice('NAVER')) : g)),
        sheet: null,
        justAdded: 'nv',
      }))
      celebrate()
      showToast('NAVER에 계획을 붙였어.')
    } else if (st.pMode === 'renew') {
      // 재계약 — 보유 유지, 기준가만 현재가로 리셋. 매매 없음
      set((prev) => {
        const hm = { ...prev.hatchedMap, 카카오: (prev.hatchedMap['카카오'] || 0) + 1 }
        const old = prev.eggs.find((g) => g.id === 'kk0')
        const kk = mk('kk', '카카오', old?.qtyN ?? 30, execPrice('카카오'))
        kk.stage = 'creature'
        kk.lv = hm['카카오']
        return {
          hatchedMap: hm,
          eggs: [...prev.eggs.filter((g) => g.id !== 'kk0'), kk],
          hatch5: true,
          hatchN: prev.hatch5 ? prev.hatchN : 5,
          hatchRate: 38,
          sheet: null,
          justAdded: 'kk',
        }
      })
      celebrate()
      showToast('카카오 부화! 이제 사육이야 — 완주할 때마다 Lv이 올라.')
    } else {
      // 새 알 = 모의 매수 (실거래 아님)
      const name = st.pName.trim() || '새 종목'
      const price = execPrice(name)
      const cost = st.pQty * price
      if (cost > st.cash) {
        showToast(`모의 현금이 부족해 — 필요 ${fmtWon(cost)}, 보유 ${fmtWon(st.cash)}`)
        return
      }
      const id = `new${Date.now()}`
      set((prev) => ({
        eggs: [...prev.eggs, mk(id, name, st.pQty, price)],
        cash: prev.cash - cost,
        sheet: null,
        justAdded: id,
      }))
      celebrate()
      showToast(`${name} ${st.pQty}주 모의 매수 체결 · ${fmtWon(cost)} — 새 알을 선반에 놓았어.`)
    }
  }

  // ─── 만기 알 ───────────────────────────────────────────────────────────
  const expiryRenew = () => openPlan('renew', 'kk0')
  const expirySend = () => {
    const egg = sRef.current.eggs.find((g) => g.id === 'kk0')
    const proceeds = egg?.qtyN ? egg.qtyN * eggPrice(egg) : 0
    set((prev) => ({
      eggs: prev.eggs.filter((g) => g.id !== 'kk0'),
      cash: prev.cash + proceeds,
      hatch5: true,
      hatchN: 5,
      hatchRate: 38,
      sheet: null,
      hatchedMap: { ...prev.hatchedMap, 카카오: 1 },
    }))
    celebrate()
    showToast(`카카오 완주 — 모의 매도 ${fmtWon(proceeds)} 회수, 부화해서 도감에 올라갔어.`)
  }

  // ─── 복기 ──────────────────────────────────────────────────────────────
  const rvPick1 = (label: string) => set({ rvA1: label, rvStep: 1 })
  const rvPick2 = (label: string) => set({ rvA2: label, rvStep: 2 })

  // ─── 확장 데모 ─────────────────────────────────────────────────────────
  const clearExtTimers = () => {
    extT.current.forEach(clearTimeout)
    extT.current = []
  }
  const extCall = () => {
    clearExtTimers()
    set({ extStep: 1 })
    extT.current.push(window.setTimeout(() => set({ extStep: 2 }), 1000))
    extT.current.push(window.setTimeout(() => set({ extStep: 3 }), 1900))
    extT.current.push(window.setTimeout(() => set({ extStep: 4 }), 2800))
  }
  const extReplay = () => {
    clearExtTimers()
    set({ extStep: 0, hEntry: 235.6, hStop: 228.0, hTarget: 253.0 })
    extT.current.push(window.setTimeout(() => extCall(), 250))
  }
  const goExt = () => {
    set({ surf: 'ext', sheet: null })
    if (sRef.current.extStep === 0) {
      extT.current.push(window.setTimeout(() => extCall(), 400))
    }
  }
  const goWeb = () => set({ surf: 'web' })

  // 손익비 핸들 드래그 (Y→가격, 0.1 스냅, 219.5~255 클램프)
  const hSet = (e: { clientY: number }) => {
    const r = chartRect.current
    const k = dragK.current
    if (!r || !k) return
    const y = e.clientY - r.top
    let p = Math.max(219.5, Math.min(255, y2p(y)))
    p = Math.round(p * 10) / 10
    set(k === 'e' ? { hEntry: p } : k === 's' ? { hStop: p } : { hTarget: p })
  }
  const hDown = (which: 'e' | 's' | 't') => (e: React.PointerEvent) => {
    e.preventDefault()
    dragK.current = which
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* pointer capture 미지원 브라우저 무시 */
    }
    chartRect.current = chartRef.current?.getBoundingClientRect() ?? null
    hSet(e)
  }
  const hMove = (e: React.PointerEvent) => {
    if (dragK.current) hSet(e)
  }
  const hUp = () => {
    dragK.current = null
  }

  const extToPlan = () => {
    const st = sRef.current
    const stopPct = Math.min(15, Math.max(1, Math.round(((st.hEntry - st.hStop) / st.hEntry) * 100)))
    const tgtPct = Math.min(40, Math.max(3, Math.round(((st.hTarget - st.hEntry) / st.hEntry) * 100)))
    openPlan('new', null, { name: 'TSLA', stop: stopPct, target: tgtPct })
    showToast(`확장에서 가져왔어 — 손절 −${stopPct}% · 익절 +${tgtPct}%`)
  }

  // 모의 계좌 요약 (금고에서만 노출) — 평가손익 = Σ 수량 × (현재가 − 진입가)
  let costBasis = 0
  let stockValue = 0
  for (const g of s.eggs) {
    if (g.stage === 'shield' || !g.qtyN) continue
    const e = g.entry ?? ENTRY[g.name] ?? 0
    const p = g.price ?? e
    costBasis += g.qtyN * e
    stockValue += g.qtyN * p
  }
  const portfolio = {
    cash: s.cash,
    stockValue,
    total: s.cash + stockValue,
    profit: stockValue - costBasis,
    costBasis,
  }

  return {
    s,
    set,
    chartRef,
    portfolio,
    execPrice,
    actions: {
      vaultDown,
      vaultUp,
      openEgg,
      openSell,
      openPlan,
      openReview,
      closeSheet,
      waitHold,
      startChange,
      cancelChange,
      confirmPull,
      adj,
      applySug,
      keepPlan,
      submitPlan,
      expiryRenew,
      expirySend,
      rvPick1,
      rvPick2,
      goWeb,
      goExt,
      extCall,
      extReplay,
      hDown,
      hMove,
      hUp,
      extToPlan,
      toggleNews: () => set((st) => ({ newsOpen: !st.newsOpen })),
      setChangeReason: (v: string) => set({ changeReason: v }),
      setPName: (v: string) => set({ pName: v }),
      setPReason: (v: string) => set({ pReason: v }),
    },
  }
}

export type HoldActions = ReturnType<typeof useHold>['actions']
