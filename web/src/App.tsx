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
import type { HoldiePose } from './app/components/holdie/Holdie'

export default function App() {
  const { s, actions: a, chartRef, portfolio, execPrice, mode, isReal, fruitsView, dexView } = useHold()

  const tired = s.openCount > 5
  const vaultBusy = s.vaultPhase === 'dialing' || s.vaultPhase === 'open'
  const pose: HoldiePose = s.celebrating ? 'celebrate' : vaultBusy ? 'peek' : tired ? 'tired' : 'idle'
  const reviewDone = s.rvStep === 2 && !!s.rvA2 && s.sheet !== 'review'

  const tabCss = (on: boolean): React.CSSProperties => ({
    padding: '7px 18px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    ...(on
      ? {
          background: 'linear-gradient(180deg,#FF5A66,#E93D4C)',
          color: '#FFFFFF',
          boxShadow: '0 4px 12px rgba(250,59,74,0.3)',
        }
      : { color: '#99A1B3' }),
  })

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 26,
        // 모바일에서도 깨지지 않게 — 데스크톱 40px, 폰에서는 12px 까지 축소
        padding: 'clamp(12px, 4vw, 40px) clamp(8px, 4vw, 40px) 56px',
        background:
          'radial-gradient(760px 520px at 18% 8%, rgba(250,59,74,0.1), transparent 65%), radial-gradient(700px 520px at 85% 80%, rgba(87,199,164,0.07), transparent 65%), #07080C',
      }}
    >
      {/* 손그림 질감 필터 (홀디 전역 참조) */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="fz" x="-25%" y="-25%" width="150%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves="2" seed="7" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="8" />
          </filter>
        </defs>
      </svg>

      {/* 헤더: 워드마크 + 표면 탭 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 800, letterSpacing: 5, color: '#F2F4F8' }}>
          HOLD
        </div>
        <div
          style={{
            display: 'flex',
            gap: 4,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 999,
            padding: 4,
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
        >
          <button onClick={a.goWeb} style={tabCss(s.surf === 'web')}>
            웹앱
          </button>
          <button onClick={a.goExt} style={tabCss(s.surf === 'ext')}>
            크롬 확장
          </button>
        </div>
        {(isReal || mode === 'guest') && (
          <button
            onClick={a.signOut}
            style={{
              fontSize: 10.5,
              fontWeight: 600,
              color: '#99A1B3',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 999,
              padding: '5px 11px',
            }}
            title={s.userEmail ?? '게스트'}
          >
            {isReal ? '로그아웃' : '게스트 나가기'}
          </button>
        )}
      </div>

      {s.surf === 'web' ? (
        <div
          style={{
            width: 'min(375px, 100%)',
            height: 'min(812px, calc(100dvh - 120px))',
            borderRadius: 28,
            overflow: 'hidden',
            position: 'relative',
            background: '#0B0E14',
            color: '#F2F4F8',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
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
            <LoginScreen busy={s.authBusy} onSignIn={a.signIn} onSignUp={a.signUp} onGuest={a.enterGuest} />
          )}

          {(mode === 'guest' || mode === 'real') && (
          <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', padding: '28px 16px 130px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 800, letterSpacing: 4, color: '#F2F4F8', opacity: 0.75 }}>
                HOLD
              </div>
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
                결정 레이어 · 실거래 없음
              </div>
            </div>

            <HoldieZone pose={pose} tired={tired} newsOpen={s.newsOpen} onToggleNews={a.toggleNews} />

            <VaultCard
              phase={s.vaultPhase}
              dialDur={s.dialDur}
              openCount={s.openCount}
              portfolio={portfolio}
              live={s.live}
              onDown={a.vaultDown}
              onUp={a.vaultUp}
            />

            <ShelfCard
              eggs={s.eggs}
              justAdded={s.justAdded}
              onOpenEgg={a.openEgg}
              onOpenPlanNew={() => a.openPlan('new', null)}
              onWildPlan={(id) => a.openPlan('wild', id)}
              onRenew={a.expiryRenew}
              onSend={a.expirySend}
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
              {/* 하단 고정: 복기 */}
              <button
                onClick={a.openReview}
                style={{
                  position: 'absolute',
                  left: 16,
                  right: 16,
                  bottom: 26,
                  zIndex: 20,
                  height: 52,
                  borderRadius: 16,
                  background: 'linear-gradient(180deg,#FF5A66,#E93D4C)',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: '0 10px 28px rgba(250,59,74,0.35)',
                }}
              >
                🎙 홀디랑 3분 복기
              </button>

              <Sheets s={s} a={a} execPrice={execPrice} isReal={isReal} />

              {/* 열매 플라잉 */}
              {s.flyOn && (
                <div style={{ position: 'absolute', left: '50%', top: '42%', zIndex: 60, pointerEvents: 'none', animation: 'flyF 0.9s ease-in forwards' }}>
                  <FruitSvg kind="pend" size={44} />
                </div>
              )}
            </>
          )}

          {/* 토스트 */}
          {s.toast && (
            <div
              style={{
                position: 'absolute',
                left: 18,
                right: 18,
                bottom: 92,
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
      ) : (
        <ExtDemo s={s} a={a} chartRef={chartRef} />
      )}

      <div style={{ fontSize: 10.5, lineHeight: 1.7, color: '#6B7280', textAlign: 'center', maxWidth: 560 }}>
        규칙 — 수익률 숫자는 금고 안에서만 · AI는 사실/조건문만 · 홀디는 비난하지 않음 · 손절 작동 =
        보험이 일한 것
      </div>
    </div>
  )
}
