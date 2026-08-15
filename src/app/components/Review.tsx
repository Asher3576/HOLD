/**
 * 말하는 복기 (스텁).
 * 계획이 끝났을 때 AI가 대화로 복기를 돕는다.
 * 규칙: AI는 절대 "사라/팔라"를 말하지 않는다. 질문만 한다.
 * (자본시장법 투자자문 정의 — 수량·가격·시기 조언 — 을 건드리지 않는 설계)
 */
export default function Review() {
  return (
    <section style={{ background: 'var(--card)', borderRadius: 16, padding: 16 }}>
      <p style={{ margin: 0, fontWeight: 700 }}>🎙️ 복기</p>
      <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.7 }}>
        계획이 끝나면 홀디가 그때의 논지를 함께 되짚어요. (Phase C)
      </p>
    </section>
  )
}
