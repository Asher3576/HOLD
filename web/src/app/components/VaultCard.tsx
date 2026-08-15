import { glass, monoNum } from '../ui'
import { DIAL_BASE, DIAL_STEP, type VaultPhase } from '../model'
import { VaultSvg } from './svg'

/** 금고 — 확인 마찰. 길게 누르면 다이얼, 열수록 느려짐. 금액은 여기서만. */
export default function VaultCard({
  phase,
  dialDur,
  openCount,
  onDown,
  onUp,
}: {
  phase: VaultPhase
  dialDur: number
  openCount: number
  onDown: (e: React.PointerEvent) => void
  onUp: () => void
}) {
  const tired = openCount > 5
  const filled = Math.min(openCount, 5)
  const nextDur = Math.round((DIAL_BASE + (openCount + 1) * DIAL_STEP) * 10) / 10
  const hint =
    phase === 'dialing'
      ? '다이얼 돌리는 중… 손 떼면 멈춰'
      : `길게 누르면 열려 · 오늘 ${openCount + 1}번째 열람 · ${nextDur}초`

  return (
    <div
      style={{
        marginTop: 16,
        borderRadius: 20,
        padding: 14,
        ...glass,
        animation: phase === 'closing' ? 'shake 0.35s ease' : undefined,
      }}
    >
      {phase === 'open' ? (
        <div
          onPointerUp={onUp}
          onPointerLeave={onUp}
          style={{
            height: 148,
            background: 'rgba(87,199,164,0.09)',
            border: '1px solid rgba(87,199,164,0.3)',
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            boxShadow: 'inset 0 0 40px rgba(87,199,164,0.08)',
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: 1.5, color: '#7A8296' }}>총 평가액</div>
          <div style={{ ...monoNum, fontSize: 26, fontWeight: 700, color: '#F2F4F8' }}>
            12,480,000원
          </div>
          <div style={{ ...monoNum, fontSize: 12, color: '#E36A5C' }}>+340,000원 · +2.8%</div>
          <div style={{ ...monoNum, fontSize: 10.5, marginTop: 3 }}>
            <span style={{ color: '#57C7A4' }}>지켜서 +1,840,000</span>
            <span style={{ color: '#7A8296' }}> · </span>
            <span style={{ color: '#99A1B3' }}>어겨서 −520,000</span>
          </div>
          <div style={{ marginTop: 2, fontSize: 9.5, color: '#5A6170' }}>
            여기서만 보여요 · 손 떼면 닫혀
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            onPointerDown={onDown}
            onPointerUp={onUp}
            onPointerLeave={onUp}
            onPointerCancel={onUp}
            onContextMenu={(e) => e.preventDefault()}
            style={{
              flex: 'none',
              cursor: 'pointer',
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            <VaultSvg dialing={phase === 'dialing'} dialDur={dialDur} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>금고</div>
            <div style={{ marginTop: 4, fontSize: 11, lineHeight: 1.55, color: '#99A1B3' }}>
              {hint}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 10 }}>
              <span style={{ display: 'flex', gap: 4.5 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background:
                        i < filled ? (tired ? '#FF6B77' : '#F2F4F8') : 'rgba(255,255,255,0.15)',
                    }}
                  />
                ))}
              </span>
              <span style={{ ...monoNum, fontSize: 11, color: '#99A1B3' }}>
                오늘 {openCount}번 열어봤어
              </span>
            </div>
            {tired && (
              <div style={{ marginTop: 7, fontSize: 11, color: '#FF6B77' }}>
                "새로운 건 없었어. 나만 피곤해졌어"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
