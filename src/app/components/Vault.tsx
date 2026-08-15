/**
 * 금고 — 계좌 요약을 감싸는 다이얼 금고 (스텁).
 * 열람 규칙: 다이얼 애니메이션 1.5초 + (오늘 열람 횟수 × 0.4초).
 * 볼수록 열기 오래 걸린다 — 확인 중독을 마찰로 완화.
 */
export default function Vault({ openCountToday = 0 }: { openCountToday?: number }) {
  const openSeconds = 1.5 + openCountToday * 0.4
  return (
    <section
      style={{
        background: 'var(--card)',
        borderRadius: 16,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <p style={{ margin: 0, fontWeight: 700 }}>🔒 금고</p>
      <p style={{ margin: '8px 0 0', fontSize: 13, opacity: 0.7 }}>
        오늘 {openCountToday}번 열람 · 다음 열기 {openSeconds.toFixed(1)}초
      </p>
    </section>
  )
}
