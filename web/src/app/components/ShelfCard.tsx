import type { Egg } from '../model'
import { glass, monoNum, RED_GRAD } from '../ui'
import { ShelfEgg, ShieldIcon } from './svg'
import { HoldieMiniPeek } from './holdie/Holdie'

/** 알 선반 — 5행. 게이지는 손절선 0 ~ 익절선 100, 숫자 없음. 85%+ 블러. */
export default function ShelfCard({
  eggs,
  justAdded,
  onOpenEgg,
  onOpenPlanNew,
  onWildPlan,
  onRenew,
  onSend,
}: {
  eggs: Egg[]
  justAdded: string | null
  onOpenEgg: (id: string) => void
  onOpenPlanNew: () => void
  onWildPlan: (id: string) => void
  onRenew: () => void
  onSend: () => void
}) {
  return (
    <div style={{ marginTop: 26 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#7A8296' }}>
          알 선반
        </span>
        <button
          onClick={onOpenPlanNew}
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: '#FFFFFF',
            background: RED_GRAD,
            borderRadius: 999,
            padding: '7px 13px',
            boxShadow: '0 6px 16px rgba(250,59,74,0.3)',
          }}
        >
          + 새 알 품기
        </button>
      </div>
      <div style={{ marginTop: 10, borderRadius: 20, padding: '6px 16px', ...glass }}>
        {eggs.map((g, i) => {
          const wild = g.stage === 'wild'
          const crea = g.stage === 'creature'
          const expiry = g.stage === 'expiry'
          const shield = g.stage === 'shield'
          const hasGauge = crea || g.stage === 'crack' || g.stage === 'plain'
          const near = hasGauge && (g.prog ?? 0) > 80
          const daysLabel = wild
            ? '계획 없음'
            : expiry
              ? '30/30일 · 만기'
              : shield
                ? '보험 작동 · 회수 완료'
                : `${crea ? `사육 Lv.${g.lv || 1} · ` : ''}${g.elapsed}/${g.days}일`
          return (
            <div
              key={g.id}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                padding: '14px 0',
                borderTop: i > 0 ? '1px solid rgba(255,255,255,0.07)' : undefined,
              }}
            >
              <button
                onClick={() => onOpenEgg(g.id)}
                style={{ flex: 'none', width: 72, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <span
                  style={{
                    display: 'block',
                    animation:
                      justAdded === g.id ? 'popIn 0.55s cubic-bezier(0.34,1.4,0.64,1)' : undefined,
                  }}
                >
                  <ShelfEgg stage={g.stage} />
                </span>
                <span
                  style={{
                    display: 'block',
                    width: 64,
                    height: 5,
                    borderRadius: 2.5,
                    background: 'rgba(255,255,255,0.14)',
                    marginTop: -2,
                  }}
                />
              </button>
              <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700 }}>{g.name}</span>
                  <span style={{ ...monoNum, fontSize: 11, color: '#7A8296' }}>{daysLabel}</span>
                </div>
                {hasGauge && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginTop: 13,
                      filter: near ? 'blur(2.5px)' : undefined,
                      opacity: near ? 0.75 : undefined,
                    }}
                  >
                    <span style={{ fontSize: 9.5, color: '#7A8296', flex: 'none' }}>손절선</span>
                    <span style={{ flex: 1, position: 'relative', height: 14, display: 'block' }}>
                      <span
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: '50%',
                          height: 2,
                          transform: 'translateY(-50%)',
                          background: 'rgba(255,255,255,0.14)',
                          borderRadius: 1,
                        }}
                      />
                      <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 2, height: 9, background: 'rgba(255,255,255,0.3)', borderRadius: 1 }} />
                      <span style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: 2, height: 9, background: 'rgba(255,255,255,0.3)', borderRadius: 1 }} />
                      <span
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: `${g.prog ?? 0}%`,
                          transform: 'translate(-50%,-50%)',
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: '#F2F4F8',
                          boxShadow: '0 0 0 2.5px rgba(11,14,20,0.9), 0 0 10px rgba(242,244,248,0.5)',
                        }}
                      />
                    </span>
                    <span style={{ fontSize: 9.5, color: '#7A8296', flex: 'none' }}>익절선</span>
                  </div>
                )}
                {near && (
                  <div style={{ marginTop: 9, display: 'flex', alignItems: 'center', gap: 7 }}>
                    <HoldieMiniPeek size={22} />
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: '#57C7A4' }}>
                      "익절선 근처예요. 계획을 믿어요"
                    </span>
                  </div>
                )}
                {wild && (
                  <>
                    <div style={{ marginTop: 9, fontSize: 12, lineHeight: 1.5, color: '#99A1B3' }}>
                      계획 없이 따라온 애야. 계획을 붙여줄래?
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onWildPlan(g.id)
                      }}
                      style={{
                        marginTop: 8,
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: '#57C7A4',
                        border: '1px solid rgba(87,199,164,0.45)',
                        borderRadius: 999,
                        padding: '6px 12px',
                      }}
                    >
                      계획 붙이기
                    </button>
                  </>
                )}
                {expiry && (
                  <>
                    <div style={{ marginTop: 9, fontSize: 12, lineHeight: 1.5, color: '#F0C06A' }}>
                      만기 도달 — 재계약할까요, 완주로 마칠까요?
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onRenew()
                        }}
                        style={{ fontSize: 11.5, fontWeight: 700, color: '#FFFFFF', background: RED_GRAD, borderRadius: 999, padding: '6px 13px' }}
                      >
                        재계약
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSend()
                        }}
                        style={{ fontSize: 11.5, fontWeight: 700, color: '#F2F4F8', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '6px 13px' }}
                      >
                        완주로 마침
                      </button>
                    </div>
                  </>
                )}
                {shield && (
                  <>
                    <div
                      style={{
                        marginTop: 9,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'rgba(87,199,164,0.12)',
                        border: '1px solid rgba(87,199,164,0.3)',
                        borderRadius: 999,
                        padding: '5px 11px',
                      }}
                    >
                      <ShieldIcon size={12} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#57C7A4' }}>
                        보험이 일했어요
                      </span>
                    </div>
                    <div style={{ marginTop: 7, fontSize: 11, color: '#99A1B3' }}>
                      손절선에서 자동 회수 — 실패가 아니야
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
