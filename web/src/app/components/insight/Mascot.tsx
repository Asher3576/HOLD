/**
 * 인사이트 프렌즈 React 래퍼.
 * 역할: bull(황소) = 메인·지킴이 / bear(곰) = 리스크·걱정 / owl(부엉이) = 데이터·분석.
 * 규칙: 캐릭터는 사용자를 비난하지 않는다 — bear의 "걱정"까지만.
 * 아트(stock-characters.js)는 핸드오프 원본 그대로 — 여기서는 조립만 한다.
 */
import { useMemo } from 'react'
import { svg as scSvg, type CharName, type CharOpts } from './stock-characters'

export type { CharName }

export default function Mascot({
  name,
  size = 200,
  mood,
  variant,
  doodles = false,
  doodleColor = '#7A8296',
  /** 다크 배경에선 베이지 바닥 그림자가 어색 — 기본 제거 (핸드오프 허용 사항) */
  shadow = false,
  anim,
  style,
}: CharOpts & {
  name: CharName
  shadow?: boolean
  anim?: 'bob' | 'jump'
  style?: React.CSSProperties
}) {
  const html = useMemo(() => {
    let s = scSvg(name, { size, mood, variant, doodles, doodleColor })
    if (!shadow) s = s.replace(/<ellipse[^>]*fill="#DDD5BC"><\/ellipse>/, '')
    return s
  }, [name, size, mood, variant, doodles, doodleColor, shadow])

  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        lineHeight: 0,
        animation:
          anim === 'bob'
            ? 'hbob 3.6s ease-in-out infinite'
            : anim === 'jump'
              ? 'jump 1.1s ease-in-out infinite'
              : undefined,
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
