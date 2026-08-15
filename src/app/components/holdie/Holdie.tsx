/**
 * 홀디 — HOLD의 수호자 캐릭터 (스텁).
 * 표정 6종: 평온/놀람/보호(가림)/보고/축하/졸림.
 * 규칙: 실망·비난 표정 금지. 사용자를 혼내지 않는다.
 * Phase A에서 SVG 본구현 예정.
 */
export type HoldieFace =
  | 'calm'
  | 'surprised'
  | 'guarding'
  | 'reporting'
  | 'celebrating'
  | 'sleepy'

export default function Holdie({ face = 'calm' }: { face?: HoldieFace }) {
  const emoji: Record<HoldieFace, string> = {
    calm: '🙂',
    surprised: '😲',
    guarding: '🫣',
    reporting: '📋',
    celebrating: '🎉',
    sleepy: '😴',
  }
  return (
    <div
      aria-label={`홀디 (${face})`}
      style={{
        width: 96,
        height: 96,
        borderRadius: '50%',
        background: 'var(--primary)',
        display: 'grid',
        placeItems: 'center',
        fontSize: 40,
        margin: '0 auto',
      }}
    >
      {emoji[face]}
    </div>
  )
}
