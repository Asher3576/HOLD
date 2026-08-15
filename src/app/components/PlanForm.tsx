/**
 * 계획(알) 만들기 폼 (스텁).
 * 필수: 손절선 / 익절선 / 기간 / 이유(논지).
 * 이유 없이는 알을 만들 수 없다 — 논지 레이더의 원천 데이터.
 */
export default function PlanForm() {
  return (
    <section style={{ background: 'var(--card)', borderRadius: 16, padding: 16 }}>
      <p style={{ margin: 0, fontWeight: 700 }}>🥚 새 알 만들기</p>
      <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.7 }}>
        손절선 · 익절선 · 기간 · 이유 — 네 가지를 정해야 알이 생겨요.
      </p>
    </section>
  )
}
