import { reviewTags } from '../review'

/** 홈 복기 기록 카드 — 복기 완료 후 표시 */
export default function ReviewRecordCard({ rvA1, rvA2 }: { rvA1: string | null; rvA2: string | null }) {
  const t = reviewTags(rvA1, rvA2)
  return (
    <div style={{ marginTop: 26 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#7A8296' }}>
        복기 기록
      </div>
      <div
        style={{
          marginTop: 10,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(87,199,164,0.35)',
          borderRadius: 18,
          padding: 14,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700 }}>SK하이닉스 조기 매도 복기</div>
        <ReviewChips rvA1={rvA1} rvA2={rvA2} />
        <div style={{ marginTop: 9, fontSize: 11.5, lineHeight: 1.6, color: '#99A1B3' }}>
          {t.rvFinal}
        </div>
      </div>
    </div>
  )
}

export function ReviewChips({ rvA1, rvA2 }: { rvA1: string | null; rvA2: string | null }) {
  const t = reviewTags(rvA1, rvA2)
  const chip = (bg: string, color: string, text: string) => (
    <span
      style={{
        fontSize: 10.5,
        fontWeight: 700,
        padding: '4px 9px',
        borderRadius: 999,
        background: bg,
        color,
      }}
    >
      {text}
    </span>
  )
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 9 }}>
      {chip('rgba(250,59,74,0.14)', '#FF8A93', `트리거 · ${t.rvTrigger}`)}
      {chip('rgba(87,199,164,0.13)', '#57C7A4', `논지 · ${t.rvThesis}`)}
      {chip('rgba(255,255,255,0.08)', '#99A1B3', `감정 · ${t.rvEmotion}`)}
    </div>
  )
}
