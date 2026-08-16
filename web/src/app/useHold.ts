/**
 * HOLD 중앙 상태 훅.
 * 모드 3종: signedOut(로그인 화면) / guest(목데이터 데모) / real(로그인 + DB 영속).
 * real 모드: 알·열매·복기·모의현금을 Supabase에 쓰고, 새로고침해도 유지된다.
 */
import { useEffect, useRef, useState } from 'react'
import type { Egg, Fruit, PlanMode, SheetKind, VaultPhase } from './model'
import { codeFor, DIAL_BASE, DIAL_STEP, SEED_CASH, SELL_COUNTDOWN } from './model'
import { baseFruits, initialEggs, initialHatchedMap } from './mock/design'
import { ENTRY } from './mock/prices'
import { fetchBrief, fetchQuotes, fetchReviewLine, type Brief, type Quote } from './lib/api'
import { supabase } from './lib/supabase'
import * as db from './lib/db'
import { reviewTags } from './review'
import { fmtWon } from './ui'
import { y2p } from './ext/chartMath'

export type AppMode = 'loading' | 'signedOut' | 'guest' | 'real'

export interface HoldState {
  surf: 'web' | 'ext'
  vaultPhase: VaultPhase
  dialDur: number
  openCount: number
  cash: number
  quotes: Record<string, Quote>
  live: boolean
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
  /** real 모드 전용 — DB에서 온 열매 뷰 */
  realFruits: Fruit[] | null
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
  /** AI 복기 대사 (real 모드) — null 이면 결정적/데모 대사 */
  rvQ0: string | null
  rvQ1: string | null
  rvFin: string | null
  extStep: number
  hEntry: number
  hStop: number
  hTarget: number
  toast: string | null
  /** real 모드 AI 뉴스 브리핑 (엣지 /brief) — null 이면 결정적 문구 폴백 */
  brief: Brief | null
  // 인증
  authReady: boolean
  userId: string | null
  userEmail: string | null
  guest: boolean
  authBusy: boolean
  /** 로그인 화면에 고정 표시되는 상태/에러 메시지 (토스트와 달리 사라지지 않음) */
  authNote: string | null
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
  realFruits: null,
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
  rvQ0: null,
  rvQ1: null,
  rvFin: null,
  extStep: 0,
  hEntry: 235.6,
  hStop: 228.0,
  hTarget: 253.0,
  toast: null,
  brief: null,
  authReady: false,
  userId: null,
  userEmail: null,
  guest: false,
  authBusy: false,
  authNote: null,
}

type Patch = Partial<HoldState> | ((s: HoldState) => Partial<HoldState>)

/**
 * 실시세 수신 → 현재가 반영.
 * - real 알: 진입가가 진짜이므로 진행률을 진입가 기준으로 직접 계산.
 * - 목 알: 목 진입가와 실가격 괴리로 0/100에 붙지 않게, 설계 진행률 기준으로 진입가 리베이스.
 */
function applyQuotes(eggs: Egg[], quotes: Record<string, Quote>): Egg[] {
  return eggs.map((g) => {
    const q = g.code ? quotes[g.code] : undefined
    if (!q || !Number.isFinite(q.price) || q.price <= 0) return g
    const next: Egg = { ...g, price: q.price }
    const planned =
      g.stop != null && g.target != null &&
      (g.stage === 'plain' || g.stage === 'crack' || g.stage === 'creature' || g.stage === 'expiry')
    if (planned && g.real && g.entry) {
      const stopPrice = g.entry * (1 - g.stop! / 100)
      const takePrice = g.entry * (1 + g.target! / 100)
      if (takePrice > stopPrice) {
        next.prog = Math.round(Math.max(0, Math.min(100, ((q.price - stopPrice) / (takePrice - stopPrice)) * 100)))
      }
    } else if (planned) {
      const s = g.stop! / 100
      const t = g.target! / 100
      const p = (g.prog ?? 50) / 100
      const denom = 1 - s + p * (s + t)
      if (denom > 0) next.entry = Math.round(q.price / denom)
    } else if (next.entry == null) {
      next.entry = q.price
    }
    return next
  })
}

export function useHold() {
  const [s, setAll] = useState<HoldState>(initial)
  const sRef = useRef(s)
  sRef.current = s

  const set = (patch: Patch) =>
    setAll((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }))

  const mode: AppMode = !s.authReady ? 'loading' : s.userId ? 'real' : s.guest ? 'guest' : 'signedOut'
  const isReal = mode === 'real'

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

  // ─── 인증 ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) {
      set({ authReady: true, guest: true }) // env 미설정 — 게스트 데모만
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user
      set({ authReady: true, userId: u?.id ?? null, userEmail: u?.email ?? null })
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user
      set((prev) => ({
        userId: u?.id ?? null,
        userEmail: u?.email ?? null,
        guest: false,
        authNote: u ? null : prev.authNote,
      }))
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  /** Supabase 인증 에러를 한국어 안내로 */
  const friendlyAuthErr = (msg: string): string => {
    const m = msg.toLowerCase()
    if (m.includes('already registered') || m.includes('already_exists')) return '이미 가입된 이메일이에요 — 아래에서 로그인으로 진행해줘'
    if (m.includes('at least 6')) return '비밀번호는 6자 이상이어야 해요'
    if (m.includes('invalid login credentials')) return '이메일 또는 비밀번호가 달라요'
    if (m.includes('not confirmed')) return '이메일 인증이 아직 안 됐어요 — 메일함(스팸함 포함)을 확인해줘'
    if (m.includes('rate limit')) return '요청이 너무 잦아요 — 잠시 후 다시 시도해줘'
    if (m.includes('invalid') && m.includes('email')) return '이메일 형식을 확인해줘'
    return `실패했어요 — ${msg}`
  }

  const signIn = async (email: string, pw: string) => {
    if (!supabase) return
    set({ authBusy: true, authNote: null })
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    set({ authBusy: false })
    if (error) set({ authNote: friendlyAuthErr(error.message) })
  }

  const signUp = async (email: string, pw: string) => {
    if (!supabase) return
    set({ authBusy: true, authNote: null })
    const { data, error } = await supabase.auth.signUp({ email, password: pw })
    set({ authBusy: false })
    if (error) {
      set({ authNote: friendlyAuthErr(error.message) })
    } else if (!data.session) {
      // 이메일 인증이 켜져 있는 프로젝트 — 세션 없이 가입만 된 상태
      set({
        authNote:
          '확인 메일을 보냈어요 — 메일함(스팸함 포함)에서 인증 후 로그인해줘. 몇 분이 지나도 안 오면 다시 시도해줘.',
      })
    }
    // 세션이 바로 오면(이메일 인증 꺼짐) onAuthStateChange 가 자동으로 로그인 처리
  }

  const signOut = async () => {
    await supabase?.auth.signOut()
    set({ ...initial, authReady: true, guest: false })
  }

  const enterGuest = () => set({ guest: true })

  // ─── real 모드 데이터 로드 ─────────────────────────────────────────────
  const loadedFor = useRef<string | null>(null)
  useEffect(() => {
    const uid = s.userId
    if (!uid || loadedFor.current === uid) return
    loadedFor.current = uid
    ;(async () => {
      const [acct, hatchedMap, stats] = await Promise.all([
        db.ensureAccount(uid),
        db.fetchHatchedMap(uid),
        db.fetchHatchStats(uid),
      ])
      const [eggs, fruits] = await Promise.all([db.fetchEggs(uid, hatchedMap), db.fetchFruits(uid)])
      set({
        eggs: eggs ?? [],
        cash: acct?.cash ?? SEED_CASH,
        hatchedMap,
        hatchN: stats.hatchN,
        hatchRate: stats.hatchRate,
        realFruits: fruits?.fruits ?? [],
        fruitTotal: fruits?.total ?? 0,
        quotes: {},
        live: false,
      })
      pendingScore.current = fruits?.pending ?? []
      quotesFor.current = null // 시세 재로드 트리거
      // AI 뉴스 브리핑 — 보유 종목명 기반 (실패해도 결정적 문구로 폴백)
      const labels = Array.from(new Set((eggs ?? []).map((g) => g.name).filter(Boolean))).slice(0, 3)
      void fetchBrief(labels).then((b) => {
        if (b) set({ brief: b })
      })
    })()
  }, [s.userId])

  // ─── 실시세 로드 (KIS) + 열매 채점 ─────────────────────────────────────
  const quotesFor = useRef<string | null>(null)
  const pendingScore = useRef<db.RealFruits['pending']>([])
  useEffect(() => {
    if (mode === 'loading' || mode === 'signedOut') return
    const codes = Array.from(
      new Set(s.eggs.map((g) => g.code).filter((c): c is string => !!c)),
    )
    const key = `${mode}:${codes.sort().join(',')}`
    if (!codes.length || quotesFor.current === key) return
    quotesFor.current = key
    let on = true
    fetchQuotes(codes).then(async (quotes) => {
      if (!on || !quotes) return
      set((st) => ({ quotes: { ...st.quotes, ...quotes }, live: true, eggs: applyQuotes(st.eggs, quotes) }))
      // 30일 지난 참은 기록 채점 (MVP: 현재가 기준 — 크론 채점은 Phase C 잔여)
      if (isReal && pendingScore.current.length) {
        const n = await db.scorePending(pendingScore.current, (sym) => quotes[sym]?.price)
        pendingScore.current = []
        if (n > 0 && sRef.current.userId) {
          const fr = await db.fetchFruits(sRef.current.userId)
          if (fr) set({ realFruits: fr.fruits, fruitTotal: fr.total })
          showToast(`열매 ${n}개가 익었어 — 저장고에서 확인해봐`)
        }
      }
    })
    return () => {
      on = false
    }
    // eslint 없음 — mode/eggs 코드 목록 변화 시 재로드
  }, [mode, s.eggs, isReal])

  /** 종목명 기준 모의 체결가: 실시세 → 목 진입가 → 10,000원 */
  const execPrice = (name: string): number => {
    const code = codeFor(name)
    const q = code ? sRef.current.quotes[code] : undefined
    if (q && Number.isFinite(q.price) && q.price > 0) return q.price
    return ENTRY[name] ?? 10_000
  }

  const ensureQuote = (name: string) => {
    const code = codeFor(name)
    if (!code || sRef.current.quotes[code]) return
    fetchQuotes([code]).then((q) => {
      if (q && q[code]) set((st) => ({ quotes: { ...st.quotes, ...q }, live: true }))
    })
  }

  const eggPrice = (g: Egg): number => g.price ?? g.entry ?? ENTRY[g.name] ?? 0

  const persistCash = (cash: number) => {
    const uid = sRef.current.userId
    if (uid) void db.saveCash(uid, cash)
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
  const openPlan = (mode2: PlanMode, eggId?: string | null, pre?: { name?: string; stop?: number; target?: number }) =>
    set({
      sheet: 'plan',
      pMode: mode2,
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
  const openReview = () => {
    set((st) => ({
      sheet: 'review',
      rvStep: st.rvA2 ? 2 : 0,
      rvA1: st.rvA2 ? st.rvA1 : null,
      rvA2: st.rvA2 ?? null,
    }))
    // real 모드: 최근 기록 기반 AI 대사 로드 (실패 시 결정적 대사)
    const st = sRef.current
    if (isReal && st.userId && !st.rvA2) {
      set({ rvQ0: null, rvQ1: null, rvFin: null })
      void (async () => {
        rvCtx.current = await db.fetchLastEnded(st.userId!)
        const line = await fetchReviewLine(0, rvCtx.current, [])
        if (line) set({ rvQ0: line })
      })()
    }
  }
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
    const newFruit: Fruit = { name: egg?.name ?? '', kind: 'pend', dir: 'D-30', note: '30일 뒤 판명' }
    set((prev) => ({
      sheet: null,
      changing: false,
      cd: null,
      flyOn: true,
      fruitTotal: n,
      fruitsExtra: [newFruit, ...prev.fruitsExtra],
      realFruits: prev.realFruits ? [newFruit, ...prev.realFruits] : prev.realFruits,
    }))
    celebrate()
    flyT.current = window.setTimeout(() => set({ flyOn: false }), 950)
    showToast(`${n}번째 열매야. 30일 뒤에 어떻게 익었는지 알려줄게`)
    if (isReal && st.userId && egg?.real) {
      void db.insertHeldRecord(st.userId, egg.id, 'hold_sell', eggPrice(egg))
    }
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
    if (egg?.real) {
      void db.endPlan(egg.id, 'sold_early')
      persistCash(st.cash + proceeds)
    }
  }

  // ─── 계획(알 만들기) ────────────────────────────────────────────────────
  const adj = (key: 'pStop' | 'pTarget' | 'pDays' | 'pQty', d: number, min: number, max: number) =>
    set((st) => ({ [key]: Math.max(min, Math.min(max, st[key] + d)) }) as Partial<HoldState>)

  const applySug = () => set({ pAi: 'applied', pStop: 7 })
  const keepPlan = () => set({ pAi: 'kept' })

  const submitPlan = () => {
    const st = sRef.current
    const mk = (id: string, name: string, qtyN: number, entryPrice: number): Egg => {
      const lv = st.hatchedMap[name] || 0
      return {
        id,
        name,
        qty: `${qtyN}주`,
        qtyN,
        code: codeFor(name),
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
        real: isReal,
      }
    }
    const target = st.eggs.find((g) => g.id === st.sheetEgg)

    if (st.pMode === 'wild' && target) {
      // 보유분에 계획만 붙임 — 매수 없음 (게스트 데모 전용 시나리오)
      set((prev) => ({
        eggs: prev.eggs.map((g) =>
          g.id === target.id ? mk(target.id, target.name, target.qtyN ?? 10, execPrice(target.name)) : g,
        ),
        sheet: null,
        justAdded: target.id,
      }))
      celebrate()
      showToast(`${target.name}에 계획을 붙였어.`)
    } else if (st.pMode === 'renew' && target) {
      // 재계약 = 기존 계획 완주(부화) + 같은 보유분으로 새 계획. 매매 없음
      const name = target.name
      const entry = execPrice(name)
      const qtyN = target.qtyN ?? 10
      const doLocal = (newId: string) =>
        set((prev) => {
          const hm = { ...prev.hatchedMap, [name]: (prev.hatchedMap[name] || 0) + 1 }
          const kk = mk(newId, name, qtyN, entry)
          kk.stage = 'creature'
          kk.lv = hm[name]
          return {
            hatchedMap: hm,
            eggs: [...prev.eggs.filter((g) => g.id !== target.id), kk],
            hatch5: name === '카카오' ? true : prev.hatch5,
            hatchN: prev.hatchN + 1,
            sheet: null,
            justAdded: newId,
          }
        })
      if (isReal && st.userId && target.real) {
        void db.endPlan(target.id, 'hatched')
        void db
          .createPlan(st.userId, {
            symbol: codeFor(name) ?? name,
            name,
            entry,
            qty: qtyN,
            stop: st.pStop,
            take: st.pTarget,
            days: st.pDays,
            reason: st.pReason,
          })
          .then((newId) => doLocal(newId ?? `local${Date.now()}`))
      } else {
        doLocal(`renew${Date.now()}`)
      }
      celebrate()
      showToast(`${name} 부화! 이제 사육이야 — 완주할 때마다 Lv이 올라.`)
    } else {
      // 새 알 = 모의 매수
      const name = st.pName.trim() || '새 종목'
      const price = execPrice(name)
      const cost = st.pQty * price
      if (cost > st.cash) {
        showToast(`모의 현금이 부족해 — 필요 ${fmtWon(cost)}, 보유 ${fmtWon(st.cash)}`)
        return
      }
      const doLocal = (id: string) => {
        set((prev) => ({
          eggs: [...prev.eggs, mk(id, name, st.pQty, price)],
          cash: prev.cash - cost,
          sheet: null,
          justAdded: id,
        }))
        celebrate()
        showToast(`${name} ${st.pQty}주 모의 매수 체결 · ${fmtWon(cost)} — 새 알을 선반에 놓았어.`)
      }
      if (isReal && st.userId) {
        void db
          .createPlan(st.userId, {
            symbol: codeFor(name) ?? name,
            name,
            entry: price,
            qty: st.pQty,
            stop: st.pStop,
            take: st.pTarget,
            days: st.pDays,
            reason: st.pReason,
          })
          .then((id) => {
            doLocal(id ?? `local${Date.now()}`)
            persistCash(sRef.current.cash)
          })
      } else {
        doLocal(`new${Date.now()}`)
      }
    }
  }

  // ─── 만기·보험 알 ──────────────────────────────────────────────────────
  const expiryRenew = (id: string) => openPlan('renew', id)

  const expirySend = (id: string) => {
    const egg = sRef.current.eggs.find((g) => g.id === id)
    if (!egg) return
    const proceeds = egg.qtyN ? egg.qtyN * eggPrice(egg) : 0
    set((prev) => ({
      eggs: prev.eggs.filter((g) => g.id !== id),
      cash: prev.cash + proceeds,
      hatch5: egg.name === '카카오' ? true : prev.hatch5,
      hatchN: prev.hatchN + 1,
      sheet: null,
      hatchedMap: { ...prev.hatchedMap, [egg.name]: (prev.hatchedMap[egg.name] || 0) + 1 },
    }))
    celebrate()
    showToast(`${egg.name} 완주 — 모의 매도 ${fmtWon(proceeds)} 회수, 부화해서 도감에 올라갔어.`)
    if (egg.real) {
      void db.endPlan(egg.id, 'hatched')
      persistCash(sRef.current.cash + proceeds)
    }
  }

  const dismissShield = (id: string) => {
    const egg = sRef.current.eggs.find((g) => g.id === id)
    set((prev) => ({ eggs: prev.eggs.filter((g) => g.id !== id), sheet: null }))
    showToast(`${egg?.name ?? ''} 선반에서 정리했어 — 보험 기록은 도감에 남아있어.`)
    if (egg?.real) void db.dismissPlan(egg.id)
  }

  // ─── 복기 ──────────────────────────────────────────────────────────────
  const rvCtx = useRef<Awaited<ReturnType<typeof db.fetchLastEnded>>>(null)
  const rvPick1 = (label: string) => {
    set({ rvA1: label, rvStep: 1 })
    if (isReal && sRef.current.userId) {
      void fetchReviewLine(1, rvCtx.current, [label]).then((line) => {
        if (line) set({ rvQ1: line })
      })
    }
  }
  const rvPick2 = (label: string) => {
    set({ rvA2: label, rvStep: 2 })
    if (isReal && sRef.current.userId) {
      void fetchReviewLine(2, rvCtx.current, [sRef.current.rvA1 ?? '', label]).then((line) => {
        if (line) set({ rvFin: line })
      })
    }
    const st = sRef.current
    if (isReal && st.userId) {
      // 복기 카드 저장 — 가장 최근 real 알에 연결 (없으면 저장 생략)
      const anchor = st.eggs.find((g) => g.real)
      if (anchor) {
        const t = reviewTags(st.rvA1, label)
        void db.insertReview(st.userId, anchor.id, {
          trigger: t.rvTrigger,
          thesis: t.rvThesis,
          emotion: t.rvEmotion,
        })
      }
    }
  }

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
      /* pointer capture 미지원 무시 */
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

  // ─── 파생 뷰 ───────────────────────────────────────────────────────────
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

  /** 열매 뷰: real 모드는 DB, 게스트는 목 + 세션 추가분 */
  const fruitsView: Fruit[] = isReal ? (s.realFruits ?? []) : [...s.fruitsExtra, ...baseFruits]

  /** 도감 뷰: hatchedMap → 생물 목록 (게스트는 디자인 고정 4+1) */
  const dexKinds = ['ss', 'hd', 'kia', 'posco', 'kakao'] as const
  const dexView = isReal
    ? Object.entries(s.hatchedMap).map(([name, lv], i) => ({
        name,
        lv,
        kind: dexKinds[i % dexKinds.length],
      }))
    : null

  return {
    s,
    set,
    mode,
    isReal,
    chartRef,
    portfolio,
    execPrice,
    fruitsView,
    dexView,
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
      dismissShield,
      ensureQuote,
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
      signIn,
      signUp,
      signOut,
      enterGuest,
    },
  }
}

export type HoldActions = ReturnType<typeof useHold>['actions']
