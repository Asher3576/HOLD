import Mascot, { type CharName } from './insight/Mascot'
import { newsItems } from '../mock/design'
import type { Brief } from '../lib/api'

export interface HeroSpec {
  name: CharName
  mood?: 'calm' | 'excited'
  anim?: 'bob' | 'jump'
}

/**
 * 히어로 존 — 인사이트 프렌즈 + 말풍선.
 * 게스트: 데모 논지 레이더(목 뉴스 14건 펼침).
 * real: 실제 상태 기반 문구만 — 목데이터를 말하지 않는다(정직성 원칙).
 */
export default function HoldieZone({
  hero,
  tired,
  newsOpen,
  onToggleNews,
  real = false,
  eggCount = 0,
  brief = null,
}: {
  hero: HeroSpec
  tired: boolean
  newsOpen: boolean
  onToggleNews: () => void
  real?: boolean
  eggCount?: number
  /** real 모드 AI 브리핑 — 있으면 요약을 말하고 실제 헤드라인을 펼친다 */
  brief?: Brief | null
}) {
  const bubbleText = real
    ? (brief?.summary ??
      (eggCount === 0
        ? '선반이 비어 있어 — 아래에서 첫 알(계획)을 품어봐.'
        : `지금 알 ${eggCount}개 품는 중 — 수익률 대신, 계획대로 가는지만 봐.`))
    : tired
      ? '"새로운 건 없었어. 나만 피곤해졌어"'
      : "오늘 뉴스 14개 읽었어. 1개는 확인해봐 — 네 'HBM 수요' 근거를 건드릴 수도 있어."
  const realItems = real ? (brief?.items ?? []) : null
  const expandable = real ? (realItems?.length ?? 0) > 0 : true
  const listItems = realItems ?? newsItems
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        <div style={{ flex: 'none', width: 92 }}>
          <Mascot name={hero.name} mood={hero.mood} size={100} anim={hero.anim ?? 'bob'} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <button
            onClick={expandable ? onToggleNews : undefined}
            className="bubble-tail"
            style={{
              position: 'relative',
              display: 'block',
              width: '100%',
              textAlign: 'left',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.13)',
              borderRadius: 18,
              borderBottomLeftRadius: 4,
              padding: '13px 14px',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              cursor: expandable ? 'pointer' : 'default',
            }}
          >
            <span style={{ display: 'block', fontSize: 13, lineHeight: 1.65, color: '#F2F4F8' }}>
              {bubbleText}
            </span>
            {expandable && (
              <span style={{ display: 'block', marginTop: 7, fontSize: 10, color: '#6B7280' }}>
                {newsOpen ? '탭해서 접기' : `탭해서 뉴스 ${listItems.length}건 보기${real ? '' : ' (데모)'}`}
              </span>
            )}
          </button>
          {!real && (
            <div
              style={{
                marginTop: 7,
                paddingLeft: 4,
                fontSize: 10.5,
                color: '#6B7280',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              이번 주 21일 중 확인이 필요했던 날 2일
            </div>
          )}
        </div>
      </div>

      {expandable && newsOpen && (
        <div
          style={{
            marginTop: 12,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.11)',
            borderRadius: 18,
            padding: '4px 14px',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {listItems.map((n, i) => {
            const link = (n as { link?: string }).link
            const inner = (
              <>
                <span
                  style={{
                    flex: 'none',
                    fontSize: 9.5,
                    fontWeight: 700,
                    padding: '3px 7px',
                    borderRadius: 999,
                    marginTop: 1,
                    background: n.rel ? 'rgba(87,199,164,0.15)' : 'rgba(255,255,255,0.08)',
                    color: n.rel ? '#57C7A4' : '#99A1B3',
                    maxWidth: 84,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {n.tag}
                </span>
                <span style={{ flex: 1, fontSize: 12, lineHeight: 1.5, color: '#D6DAE3' }}>
                  {n.headline}
                </span>
              </>
            )
            const rowStyle: React.CSSProperties = {
              display: 'flex',
              gap: 9,
              alignItems: 'flex-start',
              padding: '11px 0',
              borderTop: i > 0 ? '1px solid rgba(255,255,255,0.07)' : undefined,
              opacity: n.rel ? 1 : 0.42,
              textDecoration: 'none',
            }
            return link ? (
              <a key={i} href={link} target="_blank" rel="noreferrer" style={rowStyle}>
                {inner}
              </a>
            ) : (
              <div key={i} style={rowStyle}>
                {inner}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
