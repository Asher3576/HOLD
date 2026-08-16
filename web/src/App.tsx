import { useEffect } from 'react'
import { useHold } from './app/useHold'
import { MONO } from './app/ui'
import HoldieZone from './app/components/HoldieZone'
import VaultCard from './app/components/VaultCard'
import ShelfCard from './app/components/ShelfCard'
import ReviewRecordCard from './app/components/ReviewRecordCard'
import CollectionCards from './app/components/CollectionCards'
import LoginScreen from './app/components/LoginScreen'
import Sheets from './app/components/Sheets'
import ExtDemo from './app/components/ExtDemo'
import { FruitSvg } from './app/components/svg'
import type { HeroSpec } from './app/components/HoldieZone'

/**
 * 실서비스 셸.
 * - 모바일: 풀스크린 앱 (프레임 없음, 세이프에어리어 대응)
 * - 데스크톱: 중앙 앱 컬럼 (max 430px)
 * - 크롬 확장 데모는 #ext 해시로만 접근 (시연용)
 */
export default function App() {
  const { s, actions: a, chartRef, portfolio, execPrice, mode, isReal, fruitsView, dexView } = useHold()

  // #ext 해시 → 확장 데모 표면 (직접 진입 + 해시 변경 모두)
  useEffect(() => {
    const sync = () => {
      if (window.location.hash === '#ext') a.goExt()
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tired = s.openCount > 5
  const vaultBusy = s.vaultPhase === 'dialing' || s.vaultPhase === 'open'
  // 히어로: 축하=황소(신남·점프), 금고 열람 중/피곤=곰(걱정), 평상시=부엉이(분석가)
  const hero: HeroSpec = s.celebrating
    ? { name: 'bull', mood: 'excited', anim: 'jump' }
    : vaultBusy || tired
      ? { name: 'bear' }
      : { name: 'owl' }
  const reviewDone = s.rvStep === 2 && !!s.rvA2 && s.sheet !== 'review'

  // ─── 확장 데모 (#ext 전용 페이지) ────────────────────────────────────────
  if (s.surf === 'ext') {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          padding: 'clamp(12px, 3vw, 32px)',
          background:
            'radial-gradient(760px 520px at 18% 8%, rgba(250,59,74,0.1), transparent 65%), #07080C',
        }}
      >
        <div style={{ width: '100%', maxWidth: 960, display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => {
              window.history.replaceState(null, '', window.location.pathname)
              a.goWeb()
            }}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#99A1B3',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 999,
              padding: '7px 14px',
            }}
          >
            ← 앱으로 돌아가기
          </button>
          <span style={{ fontSize: 11, color: '#5A6170' }}>크롬 확장 데모 (시연용)</span>
        </div>
        <ExtDemo s={s} a={a} chartRef={chartRef} />
      </div>
    )
  }

  // ─── 앱 본체 ────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        justifyContent: 'center',
        background:
          'radial-gradient(760px 520px at 18% 8%, rgba(250,59,74,0.08), transparent 65%), radial-gradient(700px 520px at 85% 80%, rgba(87,199,164,0.06), transparent 65%), #07080C',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 'min(430px, 100%)',
          height: '100dvh',
          overflow: 'hidden',
          background: '#0B0E14',
          color: '#F2F4F8',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 24px 80px rgba(0,0,0,0.45)',
        }}
      >
        {/* 블러 글로우 오브 */}
        <div style={{ position: 'absolute', top: -60, left: -70, width: 300, height: 300, borderRadius: '50%', background: 'rgba(250,59,74,0.2)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 300, right: -90, width: 280, height: 280, borderRadius: '50%', background: 'rgba(87,199,164,0.13)', filter: 'blur(85px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: 10, width: 300, height: 280, borderRadius: '50%', background: 'rgba(91,132,196,0.14)', filter: 'blur(90px)', pointerEvents: 'none' }} />

        {mode === 'loading' && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 12, color: '#7A8296' }}>
            불러오는 중…
          </div>
        )}

        {mode === 'signedOut' && (
          <LoginScreen busy={s.authBusy} note={s.authNote} onSignIn={a.signIn} onSignUp={a.signUp} onGuest={a.enterGuest} />
        )}

        {(mode === 'guest' || mode === 'real') && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              overflowY: 'auto',
              padding: 'calc(20px + env(safe-area-inset-top)) 16px calc(130px + env(safe-area-inset-bottom))',
            }}
          >
            {/* 앱 헤더 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, letterSpacing: 4, color: '#F2F4F8' }}>
                HOLD
              </div>
              <span style={{ flex: 1 }} />
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#99A1B3',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}
              >
                실거래 없음
              </div>
              <button
                onClick={a.signOut}
                title={s.userEmail ?? '게스트'}
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#7A8296',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 999,
                  padding: '4px 10px',
                }}
              >
                {isReal ? '로그아웃' : '게스트'}
              </button>
            </div>

            {/* 게스트 안내 — 데모 데이터임을 명시 */}
            {!isReal && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 11,
                  lineHeight: 1.55,
                  color: '#C9A96A',
                  background: 'rgba(245,178,62,0.07)',
                  border: '1px solid rgba(245,178,62,0.22)',
                  borderRadius: 11,
                  padding: '8px 12px',
                }}
              >
                게스트 데모 — 데이터가 저장되지 않아요. 로그인하면 진짜 선반이 시작돼요.
              </div>
            )}

            <HoldieZone
              hero={hero}
              tired={tired}
              newsOpen={s.newsOpen}
              onToggleNews={a.toggleNews}
              real={isReal}
              eggCount={s.eggs.length}
            />

            {/* 핵심: 내 계획(알)들 — 금고보다 위 */}
            <ShelfCard
              eggs={s.eggs}
              justAdded={s.justAdded}
              onOpenEgg={a.openEgg}
              onOpenPlanNew={() => a.openPlan('new', null)}
              onWildPlan={(id) => a.openPlan('wild', id)}
              onRenew={a.expiryRenew}
              onSend={a.expirySend}
            />

            <VaultCard
              phase={s.vaultPhase}
              dialDur={s.dialDur}
              openCount={s.openCount}
              portfolio={portfolio}
              live={s.live}
              onDown={a.vaultDown}
              onUp={a.vaultUp}
            />

            {reviewDone && <ReviewRecordCard rvA1={s.rvA1} rvA2={s.rvA2} />}

            <CollectionCards
              hatchN={s.hatchN}
              hatchRate={s.hatchRate}
              hatch5={s.hatch5}
              fruits={fruitsView}
              fruitTotal={s.fruitTotal}
              dexOverride={dexView}
            />
          </div>
        )}

        {(mode === 'guest' || mode === 'real') && (
          <>
            {/* 하단 고정 독 — 주행동(새 알 품기) + 보조(복기) */}
            <div
              style={{
                position: 'absolute',
                left: 16,
                right: 16,
                bottom: 'calc(16px + env(safe-area-inset-bottom))',
                zIndex: 20,
                display: 'flex',
                gap: 10,
              }}
            >
              <button
                onClick={() => a.openPlan('new', null)}
                style={{
                  flex: 1.35,
                  height: 52,
                  borderRadius: 16,
                  background: 'linear-gradient(180deg,#FF5A66,#E93D4C)',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: '0 10px 28px rgba(250,59,74,0.35)',
                }}
              >
                🥚 새 알 품기
              </button>
              <button
                onClick={a.openReview}
                style={{
                  flex: 1,
                  height: 52,
                  borderRadius: 16,
                  background: 'rgba(20,24,32,0.82)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  color: '#F2F4F8',
                  fontSize: 13,
                  fontWeight: 700,
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  boxShadow: '0 10px 24px rgba(0,0,0,0.35)',
                }}
              >
                🎙 3분 복기
              </button>
            </div>

            <Sheets s={s} a={a} execPrice={execPrice} isReal={isReal} />

            {/* 열매 플라잉 */}
            {s.flyOn && (
              <div style={{ position: 'absolute', left: '50%', top: '42%', zIndex: 60, pointerEvents: 'none', animation: 'flyF 0.9s ease-in forwards' }}>
                <FruitSvg kind="pend" size={44} />
              </div>
            )}
          </>
        )}

        {/* 토스트 (모든 모드 — 로그인 실패 안내 포함) */}
        {s.toast && (
          <div
            style={{
              position: 'absolute',
              left: 18,
              right: 18,
              bottom: 'calc(88px + env(safe-area-inset-bottom))',
              zIndex: 50,
              background: 'rgba(28,32,42,0.85)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 14,
              padding: '13px 16px',
              fontSize: 13,
              lineHeight: 1.55,
              color: '#F2F4F8',
              boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
              pointerEvents: 'none',
              fontVariantNumeric: 'tabular-nums',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
            }}
          >
            {s.toast}
          </div>
        )}
      </div>
    </div>
  )
}
