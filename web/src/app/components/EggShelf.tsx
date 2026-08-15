import { priceProgress, shouldBlur, type Plan } from '@hold/shared'

/**
 * 알 선반 — 품는 중인 계획(알) 목록 (스텁).
 * 수익률 대신 진행률만. 익절 근처는 블러(goal-gradient 방어).
 * stopPct=0 && takePct=0 인 보유분은 "야생알"(계획 미설정)로 표시.
 */
export default function EggShelf({
  plans,
  prices,
}: {
  plans: Plan[]
  prices: Record<string, number>
}) {
  return (
    <section style={{ display: 'grid', gap: 12 }}>
      {plans.map((plan) => {
        const isWild = plan.stopPct === 0 && plan.takePct === 0
        const price = prices[plan.symbol] ?? plan.entryPrice
        const progress = isWild ? 0 : priceProgress(plan, price)
        const blurred = shouldBlur(progress)
        return (
          <article
            key={plan.id}
            style={{
              background: 'var(--card)',
              borderRadius: 16,
              padding: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <strong>{plan.symbolName}</strong>
              <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.7 }}>
                {isWild
                  ? '🥚 야생알 — 계획을 붙여주세요'
                  : plan.status === 'expired'
                    ? '⏰ 만기 — 재계약할까요, 완주로 마칠까요?'
                    : plan.status === 'stopped'
                      ? '🛡️ 손절선 작동 — 보험이 일했어요'
                      : `품는 중 · D+${Math.max(
                          0,
                          Math.floor(
                            (Date.now() - new Date(plan.createdAt).getTime()) /
                              86_400_000,
                          ),
                        )}`}
              </p>
            </div>
            {plan.status === 'active' && !isWild && (
              <span
                style={{
                  fontWeight: 700,
                  color: 'var(--primary)',
                  filter: blurred ? 'blur(6px)' : 'none',
                }}
                title={blurred ? '익절선 근처예요. 계획을 믿어요.' : undefined}
              >
                {Math.round(progress * 100)}%
              </span>
            )}
          </article>
        )
      })}
    </section>
  )
}
