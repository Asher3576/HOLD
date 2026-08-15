/**
 * 크롬 확장 데모 — 가짜 차트 사이트(tradechart.example/TSLA) 위 HOLD 오버레이 시뮬레이션.
 * 시퀀스: 프렌즈 부르기 → 지지/저항 선 → AI 브리핑 → 손익비 코치(핸들 드래그) → 현장 개입.
 */
import type { RefObject } from 'react'
import type { HoldState, HoldActions } from '../useHold'
import { chartCloses, chartVolH } from '../mock/design'
import { p2y } from '../ext/chartMath'
import { monoNum, MONO, redCta } from '../ui'
import Mascot from './insight/Mascot'

// 캔들 지오메트리 (정적 — 모듈에서 1회 계산)
const N = chartCloses.length
const PLOT_L = 16
const PLOT_R = 560
const STEP_X = (PLOT_R - PLOT_L) / N
const bars = chartCloses.map((c, i) => {
  const o = i === 0 ? c - 1.4 : chartCloses[i - 1]
  const up = c >= o
  const fill = up ? '#26A69A' : '#EF5350'
  const cx = Math.round((PLOT_L + STEP_X * (i + 0.5)) * 10) / 10
  const hi = Math.max(o, c) + 1.1
  const lo = Math.min(o, c) - 1.3
  const byT = p2y(Math.max(o, c))
  const byB = p2y(Math.min(o, c))
  return {
    wx: cx,
    wy1: p2y(hi),
    wy2: p2y(lo),
    bx: Math.round((cx - 7) * 10) / 10,
    by: byT,
    bh: Math.max(2, Math.round((byB - byT) * 10) / 10),
    volY: 376 - chartVolH[i],
    volH: chartVolH[i],
    fill,
  }
})
const gridYs = [255, 245, 235, 225].map((p) => ({ y: p2y(p), label: p.toFixed(1) }))

export default function ExtDemo({
  s,
  a,
  chartRef,
}: {
  s: HoldState
  a: HoldActions
  chartRef: RefObject<HTMLDivElement>
}) {
  const riskOk = s.hEntry > s.hStop && s.hTarget > s.hEntry
  const rr = riskOk ? (s.hTarget - s.hEntry) / (s.hEntry - s.hStop) : 0
  const rrWarn = !riskOk || rr < 1
  const rrText = riskOk ? `1 : ${(Math.round(rr * 10) / 10).toFixed(1)}` : '—'

  const handleDefs: Array<{ k: 'e' | 's' | 't'; label: string; price: number; color: string; dash: 'solid' | 'dashed' }> = [
    { k: 'e', label: '진입', price: s.hEntry, color: '#F2F4F8', dash: 'solid' },
    { k: 's', label: '손절', price: s.hStop, color: '#FF6B77', dash: 'dashed' },
    { k: 't', label: '목표', price: s.hTarget, color: '#57C7A4', dash: 'dashed' },
  ]

  return (
    <div style={{ width: 960, maxWidth: '96vw' }}>
      <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 30px 80px rgba(0,0,0,0.55)', background: '#10141D' }}>
        {/* 브라우저 크롬 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', background: '#171C28', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ display: 'flex', gap: 6 }}>
            <span style={dot('#FF5F57')} />
            <span style={dot('#FEBC2E')} />
            <span style={dot('#28C840')} />
          </span>
          <span
            style={{
              flex: 1,
              maxWidth: 420,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '6px 12px',
              fontFamily: MONO,
              fontSize: 11,
              color: '#8B93A3',
            }}
          >
            tradechart.example/chart/TSLA
          </span>
          <span style={{ flex: 1 }} />
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(250,59,74,0.12)', border: '1px solid rgba(250,59,74,0.3)', borderRadius: 8, padding: '4px 9px' }}>
            <Mascot name="bull" variant="head" size={16} />
            <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 800, letterSpacing: 1, color: '#FF8A93' }}>HOLD</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: 14, padding: 16, background: '#131722', alignItems: 'flex-start' }}>
          {/* 차트 영역 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#E8EBF2' }}>TSLA</span>
              <span style={{ fontSize: 11, color: '#6B7280' }}>Tesla Inc · NASDAQ</span>
              <span style={{ ...monoNum, fontSize: 14, fontWeight: 700, color: '#26A69A' }}>235.6</span>
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: 9.5, color: '#5A6170', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: '3px 8px' }}>
                지연시세 15분
              </span>
            </div>
            <div
              ref={chartRef}
              style={{ position: 'relative', height: 380, marginTop: 10, background: '#0F131C', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}
            >
              {/* 캔들 차트 (남의 사이트) */}
              <svg viewBox="0 0 640 380" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}>
                {gridYs.map((t) => (
                  <line key={t.label} x1="0" y1={t.y} x2="596" y2={t.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                ))}
                {bars.map((b, i) => (
                  <rect key={`v${i}`} x={b.bx} y={b.volY} width="14" height={b.volH} fill="rgba(255,255,255,0.08)" />
                ))}
                {bars.map((b, i) => (
                  <line key={`w${i}`} x1={b.wx} y1={b.wy1} x2={b.wx} y2={b.wy2} stroke={b.fill} strokeWidth="1.4" />
                ))}
                {bars.map((b, i) => (
                  <rect key={`b${i}`} x={b.bx} y={b.by} width="14" height={b.bh} rx="1.5" fill={b.fill} />
                ))}
                {gridYs.map((t) => (
                  <text key={`t${t.label}`} x="632" y={t.y + 3.5} textAnchor="end" fontSize="10" fill="#5A6170" fontFamily={MONO}>
                    {t.label}
                  </text>
                ))}
              </svg>

              {/* 지지/저항 오버레이 */}
              {s.extStep >= 1 && (
                <svg viewBox="0 0 640 380" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }}>
                  <line x1="12" y1={p2y(228.4)} x2="568" y2={p2y(228.4)} stroke="#57C7A4" strokeWidth="1.6" strokeDasharray="556" strokeDashoffset="556" style={{ animation: 'ghostDraw 0.8s ease 0.05s forwards' }} />
                  <line x1="12" y1={p2y(221.0)} x2="568" y2={p2y(221.0)} stroke="#57C7A4" strokeWidth="1.4" opacity="0.6" strokeDasharray="556" strokeDashoffset="556" style={{ animation: 'ghostDraw 0.8s ease 0.25s forwards' }} />
                  <line x1="12" y1={p2y(241.0)} x2="568" y2={p2y(241.0)} stroke="#FF6B77" strokeWidth="1.6" strokeDasharray="7 6" style={{ opacity: 0, animation: 'ghostFade 0.5s ease 0.5s forwards' }} />
                  <text x="562" y={p2y(228.4) - 6} textAnchor="end" fontSize="10.5" fill="#57C7A4" fontFamily={MONO} style={{ opacity: 0, animation: 'ghostFade 0.4s ease 0.75s forwards' }}>
                    지지 228.4 · 3번 터치 · 강함
                  </text>
                  <text x="562" y={p2y(221.0) - 6} textAnchor="end" fontSize="10.5" fill="#57C7A4" opacity="0.75" fontFamily={MONO} style={{ opacity: 0, animation: 'ghostFade 0.4s ease 0.95s forwards' }}>
                    지지 221.0 · 2번 터치
                  </text>
                  <text x="562" y={p2y(241.0) - 6} textAnchor="end" fontSize="10.5" fill="#FF6B77" fontFamily={MONO} style={{ opacity: 0, animation: 'ghostFade 0.4s ease 0.85s forwards' }}>
                    저항 241.0 · 3번째 테스트 중
                  </text>
                </svg>
              )}

              {/* 손익비 핸들 3개 */}
              {s.extStep >= 3 &&
                handleDefs.map((h) => (
                  <div
                    key={h.k}
                    onPointerDown={a.hDown(h.k)}
                    onPointerMove={a.hMove}
                    onPointerUp={a.hUp}
                    onPointerCancel={a.hUp}
                    style={{
                      position: 'absolute',
                      left: 8,
                      right: 52,
                      top: p2y(h.price) - 9,
                      height: 18,
                      cursor: 'ns-resize',
                      touchAction: 'none',
                      zIndex: 5,
                    }}
                  >
                    <div style={{ position: 'absolute', left: 0, right: 0, top: 8, borderTop: `2px ${h.dash} ${h.color}`, opacity: 0.9 }} />
                    <span
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        ...monoNum,
                        fontSize: 9.5,
                        fontWeight: 700,
                        padding: '2.5px 7px',
                        borderRadius: 6,
                        background: h.color,
                        color: '#0B0E14',
                      }}
                    >
                      {h.label} {h.price.toFixed(1)}
                    </span>
                  </div>
                ))}

              {/* 곰 현장 개입 */}
              {s.extStep >= 4 && (
                <div style={{ position: 'absolute', left: 12, bottom: 10, display: 'flex', alignItems: 'flex-end', gap: 8, animation: 'popIn 0.5s ease' }}>
                  <Mascot name="bear" variant="head" size={52} />
                  <div
                    style={{
                      background: 'rgba(28,32,42,0.9)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 12,
                      borderBottomLeftRadius: 3,
                      padding: '8px 11px',
                      fontSize: 11.5,
                      color: '#F2F4F8',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                    }}
                  >
                    오늘 이 차트 14번째예요 :)
                  </div>
                </div>
              )}
            </div>
            <div style={{ marginTop: 8, fontSize: 10.5, color: '#5A6170' }}>
              남의 차트 사이트 위에 HOLD 오버레이가 얹힌 모습 — 시뮬레이션
            </div>
          </div>

          {/* 우측 패널 */}
          <div style={{ width: 268, flex: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={panelGlass}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 'none' }}>
                  <Mascot name="owl" variant="head" size={36} />
                </div>
                <span>
                  <span style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#F2F4F8' }}>HOLD 확장</span>
                  <span style={{ display: 'block', fontSize: 10, color: '#7A8296', marginTop: 1 }}>결정 레이어 · 지시 없음</span>
                </span>
              </div>
              {s.extStep === 0 ? (
                <button onClick={a.extCall} style={{ marginTop: 12, width: '100%', height: 42, borderRadius: 11, fontSize: 12.5, ...redCta }}>
                  이 차트에 프렌즈 부르기
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#57C7A4', boxShadow: '0 0 8px rgba(87,199,164,0.7)' }} />
                  <span style={{ flex: 1, fontSize: 11.5, color: '#57C7A4', fontWeight: 600 }}>프렌즈 작동 중</span>
                  <button onClick={a.extReplay} style={{ fontSize: 10.5, fontWeight: 600, color: '#99A1B3', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 999, padding: '5px 10px' }}>
                    다시 재생
                  </button>
                </div>
              )}
            </div>

            {s.extStep >= 2 && (
              <div style={{ ...panelGlass, animation: 'popIn 0.45s ease' }}>
                <div style={panelLabel}>AI 애널리스트 브리핑</div>
                <div style={{ marginTop: 8, fontSize: 12.5, lineHeight: 1.7, color: '#D6DAE3' }}>
                  <span style={{ ...monoNum, color: '#FF8A93' }}>241.0</span> 저항 3번째 테스트 중,
                  거래량은 감소. 이탈 시 다음 지지{' '}
                  <span style={{ ...monoNum, color: '#57C7A4' }}>228.4</span>.{' '}
                  <span style={{ color: '#5A6170' }}>(지연시세 기준)</span>
                </div>
                <div style={{ marginTop: 8, fontSize: 9.5, color: '#5A6170' }}>
                  사실·조건문만 — 매수/매도 지시 없음
                </div>
              </div>
            )}

            {s.extStep >= 3 && (
              <div
                style={{
                  ...panelGlass,
                  animation: 'popIn 0.45s ease',
                  border: `1px solid ${rrWarn ? 'rgba(255,107,119,0.55)' : 'rgba(255,255,255,0.12)'}`,
                }}
              >
                <div style={panelLabel}>손익비 코치</div>
                <div style={{ ...monoNum, marginTop: 8, fontSize: 20, fontWeight: 700, color: rrWarn ? '#FF6B77' : '#F2F4F8' }}>
                  손익비 {rrText}
                </div>
                <div style={{ marginTop: 7, fontSize: 11.5, lineHeight: 1.6, color: '#99A1B3' }}>
                  ADX 31 추세장 · 방향 일치
                </div>
                <div style={{ fontSize: 11.5, lineHeight: 1.6, color: '#99A1B3' }}>
                  당신의 TSLA 상승 적중률 <span style={{ color: '#F2F4F8', fontWeight: 600 }}>34%</span>{' '}
                  (12건 중 4건)
                </div>
                <div style={{ ...monoNum, marginTop: 8, fontSize: 10.5, color: '#7A8296' }}>
                  진입 {s.hEntry.toFixed(1)} · 손절 {s.hStop.toFixed(1)} · 목표 {s.hTarget.toFixed(1)}
                </div>
                {rrWarn && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, background: 'rgba(250,59,74,0.1)', border: '1px solid rgba(250,59,74,0.3)', borderRadius: 10, padding: '8px 10px' }}>
                    <div style={{ flex: 'none' }}>
                      <Mascot name="bear" variant="head" size={26} />
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: '#FF8A93' }}>
                      "잃을 폭이 벌 폭보다 커요"
                    </span>
                  </div>
                )}
                <button onClick={a.extToPlan} style={{ marginTop: 11, width: '100%', height: 42, borderRadius: 11, fontSize: 12.5, ...redCta }}>
                  이대로 알 만들기 →
                </button>
                <div style={{ marginTop: 7, textAlign: 'center', fontSize: 9.5, color: '#5A6170' }}>
                  차트의 핸들 3개를 드래그해보세요
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const dot = (bg: string): React.CSSProperties => ({
  width: 11,
  height: 11,
  borderRadius: '50%',
  background: bg,
})

const panelGlass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 16,
  padding: 13,
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
}

const panelLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 1.5,
  color: '#7A8296',
}
