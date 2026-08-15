/** 바텀시트 4종 — 알 상세 / 매도 개입 / 새 알 품기 / 홀디랑 복기 */
import { useMemo } from 'react'
import type { HoldState, HoldActions } from '../useHold'
import { sellRecData } from '../mock/design'
import { eggChart } from '../mock/prices'
import { reviewTags } from '../review'
import { ghostBtn, monoNum, redCta } from '../ui'
import Holdie from './holdie/Holdie'
import PriceChart, { type PlanLine } from './PriceChart'
import { ShieldIcon } from './svg'
import { ReviewChips } from './ReviewRecordCard'

export default function Sheets({ s, a }: { s: HoldState; a: HoldActions }) {
  if (!s.sheet) return null
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30 }}>
      <div
        onClick={a.closeSheet}
        style={{ position: 'absolute', inset: 0, background: 'rgba(4,5,9,0.55)', animation: 'dimIn 0.3s ease' }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(17,20,28,0.85)',
          borderTop: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '24px 24px 0 0',
          padding: '10px 18px 40px',
          maxHeight: '90%',
          overflowY: 'auto',
          animation: 'sheetUp 0.34s cubic-bezier(0.22,0.9,0.3,1)',
          backdropFilter: 'blur(26px)',
          WebkitBackdropFilter: 'blur(26px)',
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.2)', margin: '0 auto 14px' }} />
        {s.sheet === 'detail' && <DetailSheet s={s} a={a} />}
        {s.sheet === 'sell' && <SellSheet s={s} a={a} />}
        {s.sheet === 'plan' && <PlanSheet s={s} a={a} />}
        {s.sheet === 'review' && <ReviewSheet s={s} a={a} />}
      </div>
    </div>
  )
}

// ─── 알 상세 ────────────────────────────────────────────────────────────────
function DetailSheet({ s, a }: { s: HoldState; a: HoldActions }) {
  const d = s.eggs.find((g) => g.id === s.sheetEgg) ?? s.eggs[0]
  const dWild = d?.stage === 'wild'
  const dShield = d?.stage === 'shield'
  const dNear = !dWild && !dShield && (d?.prog ?? 0) > 80
  const isCreature = d?.stage === 'creature'

  // 차트 데이터·계획선 — 알이 바뀔 때만 재계산 (토스트 등 리렌더에 차트 재생성 방지)
  const chart = useMemo(() => (d ? eggChart(d) : null), [d])
  const chartLines = useMemo<PlanLine[]>(() => {
    if (!chart) return []
    const ls: PlanLine[] = []
    if (chart.stopPrice != null) ls.push({ price: chart.stopPrice, color: '#FF6B77', title: '손절선' })
    if (chart.takePrice != null) ls.push({ price: chart.takePrice, color: '#57C7A4', title: '익절선' })
    return ls
  }, [chart])

  if (!d || !chart) return null
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 16, fontWeight: 700 }}>{d.name}</span>
        <span style={{ ...monoNum, fontSize: 11.5, color: '#7A8296' }}>{d.qty}</span>
        {isCreature && (
          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: 'rgba(255,198,110,0.14)', color: '#FFC66E' }}>
            사육 중 · Lv.{d.lv || 1}
          </span>
        )}
      </div>

      {/* 주가 흐름 — 간단 선 차트 (시세만, 수익률·평가금액 없음). 익절 근처면 게이지처럼 블러. */}
      {!dShield && (
        <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 8px 6px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 8px' }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: '#7A8296' }}>주가 흐름</span>
            <span style={{ fontSize: 9.5, color: '#5A6170' }}>지연시세 기준</span>
          </div>
          <div style={{ marginTop: 6, filter: dNear ? 'blur(2.5px)' : undefined, opacity: dNear ? 0.75 : 1 }}>
            <PriceChart data={chart.data} lines={chartLines} height={150} />
          </div>
          {dNear && (
            <div style={{ padding: '4px 8px 6px', textAlign: 'center', fontSize: 10.5, color: '#57C7A4' }}>
              익절선 근처라 차트도 살짝 가렸어 — 계획을 믿어요
            </div>
          )}
        </div>
      )}

      {dShield && (
        <>
          <div
            style={{
              marginTop: 14,
              background: 'rgba(87,199,164,0.09)',
              border: '1px solid rgba(87,199,164,0.3)',
              borderRadius: 14,
              padding: 14,
              display: 'flex',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <ShieldIcon size={34} />
            <span style={{ fontSize: 13, lineHeight: 1.65, color: '#D6DAE3' }}>
              손절선에서 자동 회수됐어. 실패가 아니라, 미리 정해둔{' '}
              <span style={{ color: '#57C7A4', fontWeight: 700 }}>보험이 일한 거야</span>.
            </span>
          </div>
          <button onClick={a.closeSheet} style={{ marginTop: 14, width: '100%', height: 50, borderRadius: 14, fontSize: 13.5, ...redCta }}>
            확인
          </button>
        </>
      )}

      {dWild && (
        <>
          <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 14, fontSize: 13, lineHeight: 1.6 }}>
            계획 없이 따라온 애야. 계획을 붙여줄래?
          </div>
          <button
            onClick={() => a.openPlan('wild', d.id)}
            style={{ marginTop: 14, width: '100%', height: 50, borderRadius: 14, fontSize: 13.5, ...redCta }}
          >
            계획 붙이기
          </button>
          <button onClick={a.closeSheet} style={{ display: 'block', margin: '12px auto 0', fontSize: 12, color: '#7A8296' }}>
            나중에
          </button>
        </>
      )}

      {!dWild && !dShield && (
        <>
          <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '4px 14px' }}>
            <Row label="손절선" value={`−${d.stop || 0}%`} />
            <Row label="익절선" value={`+${d.target || 0}%`} top />
            <Row label="기간" value={`${d.days || 0}일 중 ${d.elapsed || 0}일`} top />
            <div style={{ padding: '11px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 12, color: '#99A1B3' }}>매수 이유</span>
              <span style={{ display: 'block', marginTop: 5, fontSize: 13.5, lineHeight: 1.5 }}>
                "{d.reason}"
              </span>
            </div>
          </div>
          {!dNear && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, padding: '0 2px' }}>
              <span style={{ fontSize: 10, color: '#7A8296', flex: 'none' }}>손절선</span>
              <span style={{ flex: 1, position: 'relative', height: 14, display: 'block' }}>
                <span style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 2, transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.14)' }} />
                <span
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: `${d.prog ?? 0}%`,
                    transform: 'translate(-50%,-50%)',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#F2F4F8',
                    boxShadow: '0 0 0 2.5px rgba(17,20,28,0.9), 0 0 10px rgba(242,244,248,0.5)',
                  }}
                />
              </span>
              <span style={{ fontSize: 10, color: '#7A8296', flex: 'none' }}>익절선</span>
            </div>
          )}
          {dNear && (
            <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: '#57C7A4' }}>
              "익절선 근처예요. 계획을 믿어요"
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button onClick={a.closeSheet} style={{ flex: 1, height: 52, borderRadius: 14, fontSize: 13.5, ...redCta }}>
              {isCreature ? '계속 키운다' : '계속 품는다'}
            </button>
            <button onClick={a.openSell} style={{ flex: 1, height: 52, borderRadius: 14, fontSize: 13.5, ...ghostBtn }}>
              팔고 싶어요
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function Row({ label, value, top }: { label: string; value: string; top?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '11px 0',
        borderTop: top ? '1px solid rgba(255,255,255,0.08)' : undefined,
      }}
    >
      <span style={{ fontSize: 12, color: '#99A1B3' }}>{label}</span>
      <span style={{ ...monoNum, fontSize: 13, fontWeight: 600 }}>{value}</span>
    </div>
  )
}

// ─── 매도 개입 ──────────────────────────────────────────────────────────────
function SellSheet({ s, a }: { s: HoldState; a: HoldActions }) {
  const d = s.eggs.find((g) => g.id === s.sheetEgg) ?? s.eggs[0]
  if (!d) return null
  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Holdie pose="guard" size={66} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{d.name} — 팔기 전에</div>
          <div style={{ marginTop: 3, fontSize: 11, color: '#7A8296' }}>홀디가 알을 지키는 중</div>
        </div>
      </div>

      {/* 과거의 나 */}
      <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 14 }}>
        <div style={{ fontSize: 11, color: '#7A8296' }}>{d.memoL}</div>
        <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.55 }}>"{d.memoQ || d.reason}"</div>
        <div style={{ marginTop: 8, fontSize: 12.5, color: '#99A1B3' }}>이 이유, 아직 살아있어?</div>
      </div>

      {/* 과거 매도 12건 */}
      <div style={{ marginTop: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 14 }}>
        <div style={{ fontSize: 12.5, lineHeight: 1.65, color: '#D6DAE3' }}>
          당신의 과거 매도 <span style={{ fontWeight: 700, color: '#F2F4F8' }}>12건</span> 중{' '}
          <span style={{ fontWeight: 700, color: '#E36A5C' }}>8건</span>은 판 자리에서 30일 뒤 가격이
          더 올랐어요. 반대였던 4건도 함께 보여드릴게요.
        </div>
        <div style={{ marginTop: 10, maxHeight: 164, overflowY: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {sellRecData.map((r, i) => (
            <div
              key={r.n}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 0',
                borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : undefined,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, minWidth: 92 }}>{r.n}</span>
              <span style={{ ...monoNum, fontSize: 10.5, color: '#7A8296' }}>{r.d} 매도</span>
              <span style={{ flex: 1 }} />
              <span
                style={{
                  flex: 'none',
                  fontSize: 9.5,
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 999,
                  background: r.up ? 'rgba(227,106,92,0.14)' : 'rgba(91,132,196,0.16)',
                  color: r.up ? '#E36A5C' : '#7FA8E8',
                }}
              >
                {r.up ? '30일 뒤 상승' : '30일 뒤 하락'}
              </span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 10, color: '#5A6170' }}>
          방향만 보여줘요 — 수익률 숫자는 금고 안에서만
        </div>
      </div>

      {!s.changing ? (
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button onClick={a.waitHold} style={{ flex: 1, height: 56, borderRadius: 14, fontSize: 13.5, ...redCta }}>
            참을게요
          </button>
          <button
            onClick={a.startChange}
            style={{ flex: 1, height: 56, borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, ...ghostBtn }}
          >
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>그래도 팔게요</span>
            <span style={{ fontSize: 10.5, color: '#7A8296', fontWeight: 400 }}>이유 입력</span>
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 14 }}>
          <input
            value={s.changeReason}
            onChange={(e) => a.setChangeReason(e.target.value)}
            placeholder="파는 이유"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.25)',
              padding: '9px 0',
              color: '#F2F4F8',
              fontSize: 14,
            }}
          />
          {s.cd !== null && s.cd > 0 && (
            <div
              style={{
                marginTop: 14,
                width: '100%',
                height: 52,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#7A8296',
                fontSize: 13.5,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              팔기까지 {s.cd}초 — 그동안 이유를 적어줘
            </div>
          )}
          {s.cd === 0 && (
            <button
              onClick={a.confirmPull}
              style={{ marginTop: 14, width: '100%', height: 52, borderRadius: 14, background: '#F2F4F8', color: '#11141B', fontSize: 13.5, fontWeight: 700 }}
            >
              그래도 팔게요
            </button>
          )}
          <button onClick={a.cancelChange} style={{ display: 'block', margin: '12px auto 0', fontSize: 12, color: '#7A8296' }}>
            돌아가기
          </button>
        </div>
      )}
    </div>
  )
}

// ─── 새 알 품기 ─────────────────────────────────────────────────────────────
function PlanSheet({ s, a }: { s: HoldState; a: HoldActions }) {
  const pComplete = s.pReason.trim().length > 0
  const aiDecided = s.pAi !== null
  const title =
    s.pMode === 'wild' ? 'NAVER 계획 붙이기' : s.pMode === 'renew' ? '카카오 사육 계획' : '새 알 품기'
  const stepper = (
    label: string,
    valueLabel: string,
    onDec: () => void,
    onInc: () => void,
    top?: boolean,
  ) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '11px 0',
        borderTop: top ? '1px solid rgba(255,255,255,0.08)' : undefined,
      }}
    >
      <span style={{ fontSize: 12.5, color: '#99A1B3' }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <button onClick={onDec} style={stepBtn}>
          −
        </button>
        <span style={{ ...monoNum, fontSize: 15, fontWeight: 700, minWidth: 56, textAlign: 'center' }}>
          {valueLabel}
        </span>
        <button onClick={onInc} style={stepBtn}>
          +
        </button>
      </span>
    </div>
  )
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
      <div style={{ marginTop: 4, fontSize: 11, color: '#7A8296' }}>
        계획이 곧 알이야 — 4개만 정하면 돼 · 이유가 비어 있으면 만들 수 없어
      </div>
      {s.pMode === 'new' && (
        <input
          value={s.pName}
          onChange={(e) => a.setPName(e.target.value)}
          placeholder="종목명"
          style={{
            marginTop: 14,
            width: '100%',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            outline: 'none',
            borderRadius: 12,
            padding: '12px 14px',
            color: '#F2F4F8',
            fontSize: 14,
          }}
        />
      )}
      <div style={{ marginTop: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '2px 14px' }}>
        {stepper('손절선', `−${s.pStop}%`, () => a.adj('pStop', 1, 1, 15), () => a.adj('pStop', -1, 1, 15))}
        {stepper('익절선', `+${s.pTarget}%`, () => a.adj('pTarget', -1, 3, 40), () => a.adj('pTarget', 1, 3, 40), true)}
        {stepper('기간', `${s.pDays}일`, () => a.adj('pDays', -5, 5, 180), () => a.adj('pDays', 5, 5, 180), true)}
        <div style={{ padding: '11px 0 14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: 12.5, color: '#99A1B3' }}>매수 이유</span>
          <input
            value={s.pReason}
            onChange={(e) => a.setPReason(e.target.value)}
            placeholder="한 줄로 남겨두세요 (필수)"
            style={{
              marginTop: 8,
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.2)',
              padding: '7px 0',
              color: '#F2F4F8',
              fontSize: 14,
            }}
          />
        </div>
      </div>

      {pComplete && (
        <>
          <div style={{ marginTop: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: '#7A8296' }}>
              홀디의 계획 검증
            </div>
            <div style={{ marginTop: 9, fontSize: 12.5, lineHeight: 1.65, color: '#D6DAE3' }}>
              최근 20일 평균 변동폭이{' '}
              <span style={{ ...monoNum, fontWeight: 700, color: '#F2F4F8' }}>2.8%</span>야. −3%
              손절선은 평소 흔들림만으로 하루 안에 닿기 쉬워.
            </div>
            <div style={aiBox}>
              지난 6개월에 적용해보면 →{' '}
              <span style={{ color: '#F2F4F8', fontWeight: 600 }}>14번 중 11번 손절</span> (평균
              1.8일)
            </div>
            <div style={{ ...aiBox, marginTop: 7 }}>
              −7%로 넓히면 → <span style={{ color: '#F2F4F8', fontWeight: 600 }}>3번</span> · 사실만
              알려줄게, 결정은 네 몫이야
            </div>
            {!aiDecided ? (
              <div style={{ display: 'flex', gap: 10, marginTop: 13 }}>
                <button onClick={a.applySug} style={{ flex: 1, height: 44, borderRadius: 12, fontSize: 13, ...redCta }}>
                  제안 반영
                </button>
                <button onClick={a.keepPlan} style={{ flex: 1, height: 44, borderRadius: 12, fontSize: 13, ...ghostBtn }}>
                  내 계획 유지
                </button>
              </div>
            ) : (
              <div style={{ marginTop: 12, fontSize: 12, fontWeight: 600, color: '#57C7A4' }}>
                {s.pAi === 'applied' ? '반영했어 — 손절선 −7%' : '알겠어, 네 계획대로 갈게'}
              </div>
            )}
          </div>
          {aiDecided && (
            <button onClick={a.submitPlan} style={{ marginTop: 14, width: '100%', height: 52, borderRadius: 14, fontSize: 14, ...redCta }}>
              이 알을 품는다
            </button>
          )}
        </>
      )}
    </div>
  )
}

const stepBtn: React.CSSProperties = {
  width: 29,
  height: 29,
  borderRadius: 999,
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.15)',
  fontSize: 15,
  color: '#F2F4F8',
}

const aiBox: React.CSSProperties = {
  marginTop: 10,
  padding: '11px 12px',
  background: 'rgba(255,255,255,0.05)',
  borderRadius: 11,
  fontSize: 12,
  lineHeight: 1.65,
  color: '#99A1B3',
}

// ─── 홀디랑 복기 ────────────────────────────────────────────────────────────
function ReviewSheet({ s, a }: { s: HoldState; a: HoldActions }) {
  const t = reviewTags(s.rvA1, s.rvA2)
  const holdieBubble = (text: string) => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <div style={{ flex: 'none', marginTop: 2 }}>
        <Holdie pose="chat" size={30} animate={false} />
      </div>
      <div
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '4px 14px 14px 14px',
          padding: '11px 13px',
          fontSize: 13,
          lineHeight: 1.6,
          maxWidth: '82%',
        }}
      >
        {text}
      </div>
    </div>
  )
  const meBubble = (text: string) => (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div
        style={{
          background: 'rgba(250,59,74,0.15)',
          border: '1px solid rgba(250,59,74,0.3)',
          borderRadius: '14px 4px 14px 14px',
          padding: '11px 13px',
          fontSize: 13,
          color: '#FFD3D7',
          maxWidth: '82%',
        }}
      >
        {text}
      </div>
    </div>
  )
  const chip = (label: string, onClick: () => void) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        fontSize: 12.5,
        fontWeight: 600,
        color: '#FF8A93',
        border: '1px solid rgba(250,59,74,0.45)',
        borderRadius: 999,
        padding: '9px 14px',
      }}
    >
      {label}
    </button>
  )
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700 }}>홀디랑 3분 복기</div>
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {holdieBubble('오늘 SK하이닉스 알을 18일 일찍 꺼냈네. 그때 무슨 생각이었어?')}
        {s.rvStep >= 1 && (
          <>
            {meBubble(s.rvA1 ?? '')}
            {holdieBubble('매수 이유(HBM 수요)에는 변화가 있었어?')}
          </>
        )}
        {s.rvStep >= 2 && (
          <>
            {meBubble(s.rvA2 ?? '')}
            {holdieBubble(t.rvFinal)}
          </>
        )}
      </div>
      {s.rvStep === 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          {chip('뉴스가 불안해서', () => a.rvPick1('뉴스가 불안해서'))}
          {chip('숫자가 무서워서', () => a.rvPick1('숫자가 무서워서'))}
          {chip('이유가 무너져서', () => a.rvPick1('이유가 무너져서'))}
        </div>
      )}
      {s.rvStep === 1 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          {chip('없었다', () => a.rvPick2('없었다'))}
          {chip('있었다', () => a.rvPick2('있었다'))}
        </div>
      )}
      {s.rvStep === 2 && (
        <>
          <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(87,199,164,0.35)', borderRadius: 14, padding: 13 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#7A8296' }}>복기 카드</div>
            <ReviewChips rvA1={s.rvA1} rvA2={s.rvA2} />
          </div>
          <button onClick={a.closeSheet} style={{ marginTop: 14, width: '100%', height: 50, borderRadius: 14, fontSize: 13.5, ...redCta }}>
            닫기
          </button>
        </>
      )}
    </div>
  )
}
