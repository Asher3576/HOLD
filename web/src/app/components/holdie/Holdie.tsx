/**
 * 홀디 — 빨간 복슬 수호자 (v5).
 * 삐죽삐죽 털 실루엣 + feTurbulence 손그림 질감(#fz 필터, App에서 defs 제공).
 * 표정: idle(평온) / peek(눈가림 훔쳐보기) / tired(피곤) / celebrate(축하 점프)
 *      / guard(보호 — 팔짱+결연 눈썹+알 안음) / surprised(놀람) / chat(작은 아바타)
 * 규칙: 실망·비난 표정 없음.
 */

export type HoldiePose =
  | 'idle'
  | 'peek'
  | 'tired'
  | 'celebrate'
  | 'guard'
  | 'surprised'
  | 'chat'

const BODY =
  'M36 18 L50 34 L60 24 L70 34 L84 18 L88 40 L100 38 L94 54 L108 60 L92 70 L102 82 L86 84 L88 100 L72 94 L66 110 L56 98 L44 108 L40 94 L26 96 L30 82 L14 76 L28 66 L16 52 L30 52 L24 32 L36 38 Z'

const RED = '#FA3B4A'
const INK = '#11141B'

export default function Holdie({
  pose = 'idle',
  size = 108,
  animate = true,
}: {
  pose?: HoldiePose
  size?: number
  animate?: boolean
}) {
  const wrapAnim = !animate
    ? undefined
    : pose === 'idle'
      ? 'hbob 3.6s ease-in-out infinite'
      : pose === 'celebrate'
        ? 'jump 1.1s ease-in-out infinite'
        : undefined

  if (pose === 'guard') {
    // 매도 개입 — 팔짱 + 결연한 눈썹 + 알 안음 (viewBox 세로 확장)
    return (
      <svg viewBox="0 0 120 126" style={{ width: size, height: 'auto', display: 'block' }}>
        <g style={{ filter: 'url(#fz)' }}>
          <path d={BODY} fill={RED} />
        </g>
        <path d="M37 47 L53 52" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        <path d="M83 47 L67 52" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="46" cy="62" rx="5.5" ry="7" fill={INK} />
        <ellipse cx="74" cy="62" rx="5.5" ry="7" fill={INK} />
        <circle cx="44.5" cy="59.5" r="1.5" fill="#FFFFFF" />
        <circle cx="72.5" cy="59.5" r="1.5" fill="#FFFFFF" />
        <g style={{ filter: 'url(#fz)' }}>
          <ellipse cx="60" cy="80" rx="12" ry="8.5" fill={INK} />
        </g>
        <ellipse cx="60" cy="104" rx="14" ry="15" fill="#F6EDD9" stroke={INK} strokeWidth="2" />
        <path d="M30 92 Q42 99 54 95 Q62 92 68 95" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M54 101 Q66 106 78 99 Q85 94 90 90" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 120 120"
      style={{ width: size, height: 'auto', display: 'block', animation: wrapAnim }}
    >
      {pose === 'celebrate' && (
        <g style={{ filter: 'url(#fz)' }}>
          <path d="M26 72 Q10 60 16 44" fill="none" stroke={RED} strokeWidth="11" strokeLinecap="round" />
          <path d="M94 72 Q110 60 104 44" fill="none" stroke={RED} strokeWidth="11" strokeLinecap="round" />
        </g>
      )}
      <g style={{ filter: 'url(#fz)' }}>
        <path d={BODY} fill={RED} />
      </g>

      {pose === 'idle' && (
        <>
          <ellipse cx="36" cy="70" rx="5" ry="3.5" fill="#FF8E98" opacity="0.5" />
          <ellipse cx="84" cy="70" rx="5" ry="3.5" fill="#FF8E98" opacity="0.5" />
          <g
            style={{
              transformBox: 'fill-box',
              transformOrigin: 'center',
              animation: animate ? 'hblink 4.4s ease-in-out infinite' : undefined,
            }}
          >
            <ellipse cx="46" cy="60" rx="6" ry="8" fill={INK} />
            <ellipse cx="74" cy="60" rx="6" ry="8" fill={INK} />
            <circle cx="44" cy="57" r="1.8" fill="#FFFFFF" />
            <circle cx="72" cy="57" r="1.8" fill="#FFFFFF" />
          </g>
          <g style={{ filter: 'url(#fz)' }}>
            <ellipse cx="60" cy="80" rx="13" ry="9.5" fill={INK} />
          </g>
          <path d="M32 90 Q42 96 52 93 Q60 91 66 93" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path d="M54 98 Q66 102 76 96 Q82 92 86 89" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path d="M110 26 L112 31 L117 33 L112 35 L110 40 L108 35 L103 33 L108 31 Z" fill="rgba(255,255,255,0.45)" />
          <path d="M10 34 L11.5 37.5 L15 39 L11.5 40.5 L10 44 L8.5 40.5 L5 39 L8.5 37.5 Z" fill="rgba(255,255,255,0.35)" />
        </>
      )}

      {pose === 'peek' && (
        <>
          <ellipse cx="60" cy="59" rx="4.5" ry="6" fill={INK} />
          <circle cx="58.8" cy="56.5" r="1.3" fill="#FFFFFF" />
          <g style={{ filter: 'url(#fz)' }}>
            <ellipse cx="42" cy="62" rx="12" ry="10.5" fill={RED} />
            <ellipse cx="78" cy="62" rx="12" ry="10.5" fill={RED} />
          </g>
          <path d="M36 56 L36 68 M43 54.5 L43 70 M77 54.5 L77 70 M84 56 L84 68" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          <g style={{ filter: 'url(#fz)' }}>
            <ellipse cx="60" cy="82" rx="12" ry="9" fill={INK} />
          </g>
        </>
      )}

      {pose === 'tired' && (
        <>
          <path d="M40 58 Q46 64 52 58" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d="M68 58 Q74 64 80 58" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d="M41 68 Q46 71 51 68" fill="none" stroke="#8C1F2A" strokeWidth="2" strokeLinecap="round" />
          <path d="M69 68 Q74 71 79 68" fill="none" stroke="#8C1F2A" strokeWidth="2" strokeLinecap="round" />
          <g style={{ filter: 'url(#fz)' }}>
            <ellipse cx="60" cy="82" rx="13" ry="9.5" fill={INK} />
          </g>
          <path d="M32 94 Q44 99 56 96" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path d="M58 100 Q70 103 82 96" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        </>
      )}

      {pose === 'celebrate' && (
        <>
          <path d="M40 60 Q46 53 52 60" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d="M68 60 Q74 53 80 60" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <g style={{ filter: 'url(#fz)' }}>
            <ellipse cx="60" cy="80" rx="13" ry="9.5" fill={INK} />
          </g>
          <path d="M108 22 L110 27 L115 29 L110 31 L108 36 L106 31 L101 29 L106 27 Z" fill="rgba(255,255,255,0.55)" />
          <path d="M12 30 L13.5 33.5 L17 35 L13.5 36.5 L12 40 L10.5 36.5 L7 35 L10.5 33.5 Z" fill="rgba(255,255,255,0.4)" />
        </>
      )}

      {pose === 'surprised' && (
        <>
          <circle cx="46" cy="60" r="7" fill="#FFFFFF" />
          <circle cx="74" cy="60" r="7" fill="#FFFFFF" />
          <circle cx="46" cy="61" r="2.6" fill={INK} />
          <circle cx="74" cy="61" r="2.6" fill={INK} />
          <ellipse cx="60" cy="80" rx="6" ry="7" fill={INK} />
        </>
      )}

      {pose === 'chat' && (
        <>
          <ellipse cx="46" cy="60" rx="6" ry="8" fill={INK} />
          <ellipse cx="74" cy="60" rx="6" ry="8" fill={INK} />
          <circle cx="44" cy="57" r="1.8" fill="#FFFFFF" />
          <circle cx="72" cy="57" r="1.8" fill="#FFFFFF" />
          <ellipse cx="60" cy="80" rx="12" ry="8.5" fill={INK} />
        </>
      )}
    </svg>
  )
}

/** 알 선반 "익절선 근처" 미니 홀디 (22px, 눈가림 굵은 버전) */
export function HoldieMiniPeek({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 120" style={{ width: size, height: size, flex: 'none' }}>
      <g style={{ filter: 'url(#fz)' }}>
        <path d={BODY} fill={RED} />
      </g>
      <g style={{ filter: 'url(#fz)' }}>
        <ellipse cx="42" cy="62" rx="13" ry="11" fill={RED} />
        <ellipse cx="78" cy="62" rx="13" ry="11" fill={RED} />
      </g>
      <path d="M36 56 L36 68 M43 54.5 L43 70 M77 54.5 L77 70 M84 56 L84 68" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

/** 확장 현장 개입용 눈가림 홀디 (외눈 + 눈가림 손) */
export function HoldieExtPeek({ size = 52 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 120" style={{ width: size, height: size }}>
      <g style={{ filter: 'url(#fz)' }}>
        <path d={BODY} fill={RED} />
      </g>
      <ellipse cx="60" cy="59" rx="4.5" ry="6" fill={INK} />
      <g style={{ filter: 'url(#fz)' }}>
        <ellipse cx="42" cy="62" rx="12" ry="10.5" fill={RED} />
        <ellipse cx="78" cy="62" rx="12" ry="10.5" fill={RED} />
      </g>
      <path d="M36 56 L36 68 M43 54.5 L43 70 M77 54.5 L77 70 M84 56 L84 68" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/** 확장 아이콘용 (눈만) */
export function HoldieIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 120" style={{ width: size, height: size }}>
      <g style={{ filter: 'url(#fz)' }}>
        <path d={BODY} fill={RED} />
      </g>
      <ellipse cx="46" cy="60" rx="6" ry="8" fill={INK} />
      <ellipse cx="74" cy="60" rx="6" ry="8" fill={INK} />
    </svg>
  )
}
