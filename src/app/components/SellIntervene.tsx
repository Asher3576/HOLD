import type { PastSell } from '../lib/types'

/**
 * 매도 개입 — "팔고 싶다"를 눌렀을 때 (스텁).
 * 조언하지 않는다. 본인의 과거 매도 기록만 비춘다.
 * 반례("팔길 잘한" 건)도 반드시 함께 노출한다.
 */
export default function SellIntervene({ pastSells }: { pastSells: PastSell[] }) {
  const regretted = pastSells.filter((s) => s.afterPct > 0)
  return (
    <section style={{ background: 'var(--card)', borderRadius: 16, padding: 16 }}>
      <p style={{ margin: 0, fontWeight: 700 }}>당신의 과거 매도 {pastSells.length}건</p>
      <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.7 }}>
        그중 {regretted.length}건은 판 자리에서 30일 뒤 가격이 더 올랐어요.
        (반대였던 {pastSells.length - regretted.length}건도 함께 보여드려요)
      </p>
    </section>
  )
}
