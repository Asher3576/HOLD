import type { HeldRecord } from '@hold/shared'

/**
 * 도감 — 부화(완주) 기록과 열매(참은 기록) 수집 (스텁).
 * 손절 작동도 "보험이 일한 것"으로 수집된다. 실패 진열장이 아니다.
 */
export default function Collection({ heldRecords }: { heldRecords: HeldRecord[] }) {
  return (
    <section style={{ background: 'var(--card)', borderRadius: 16, padding: 16 }}>
      <p style={{ margin: 0, fontWeight: 700 }}>🍎 열매 {heldRecords.length}개</p>
      <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.7 }}>
        참을 때마다 자동으로 저장돼요. 시간이 지나면 결과가 채점됩니다.
      </p>
    </section>
  )
}
