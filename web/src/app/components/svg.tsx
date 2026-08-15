/** 알·열매·생물·금고·방패 SVG 에셋 (v5 벡터 그대로 이식) */
import type { EggStage, FruitKind } from '../model'

const INK = '#11141B'

/** 선반 알 (56px) — stage별 렌더. creature는 병아리(사육). */
export function ShelfEgg({ stage }: { stage: EggStage }) {
  const shadow = <ellipse cx="23" cy="59" rx="15" ry="3.5" fill="rgba(0,0,0,0.5)" />
  const eggBody = (fill: string, opacity?: number) => (
    <path
      d="M23 4 C33 4 41 17 41 32 C41 46 33 55 23 55 C13 55 5 46 5 32 C5 17 13 4 23 4 Z"
      fill={fill}
      opacity={opacity}
      stroke={INK}
      strokeWidth="1.6"
    />
  )
  return (
    <svg viewBox="0 0 46 64" style={{ width: 56, height: 'auto', display: 'block' }}>
      {shadow}
      {stage === 'creature' && (
        <g style={{ animation: 'hbob 2.8s ease-in-out infinite' }}>
          <circle cx="23" cy="37" r="16.5" fill="#FFC66E" stroke={INK} strokeWidth="1.6" />
          <path d="M23 21 Q20 13 14 15 Q19 17 20 21" fill="#7ED6A8" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          <ellipse cx="17.5" cy="35" rx="3" ry="3.6" fill="#FFFFFF" />
          <ellipse cx="28.5" cy="35" rx="3" ry="3.6" fill="#FFFFFF" />
          <circle cx="18" cy="35.6" r="1.4" fill={INK} />
          <circle cx="28" cy="35.6" r="1.4" fill={INK} />
          <path d="M21 41 L25 41 L23 44 Z" fill="#E8574C" />
          <ellipse cx="14" cy="46" rx="3.6" ry="2.6" fill="#FF8E98" opacity="0.6" />
          <ellipse cx="32" cy="46" rx="3.6" ry="2.6" fill="#FF8E98" opacity="0.6" />
        </g>
      )}
      {stage === 'crack' && (
        <g
          style={{
            transformBox: 'fill-box',
            transformOrigin: '50% 92%',
            animation: 'wob 2.6s ease-in-out infinite',
          }}
        >
          {eggBody('#F6EDD9')}
          <circle cx="31" cy="27" r="2.4" fill="#D9B87E" />
          <circle cx="14" cy="35" r="2.4" fill="#D9B87E" />
          <path d="M13 20 L19 24 L16 29 L23 32 L20 37" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {stage === 'plain' && eggBody('#F6EDD9')}
      {stage === 'wild' && (
        <>
          {eggBody('#6E7686')}
          <circle cx="17" cy="25" r="1.7" fill="#4A515F" />
          <circle cx="29" cy="33" r="1.7" fill="#4A515F" />
          <circle cx="19" cy="42" r="1.7" fill="#4A515F" />
        </>
      )}
      {stage === 'expiry' && (
        <g
          style={{
            transformBox: 'fill-box',
            transformOrigin: '50% 92%',
            animation: 'wob 1.9s ease-in-out infinite',
          }}
        >
          {eggBody('#EFD9A8')}
          <circle cx="27" cy="26" r="2.4" fill="#D4B269" />
          <circle cx="16" cy="36" r="2.4" fill="#D4B269" />
        </g>
      )}
      {stage === 'shield' && (
        <>
          {eggBody('#F6EDD9', 0.55)}
          <path d="M32 34 L43 37.5 V44 C43 50 38.5 54.5 32 57 C25.5 54.5 21 50 21 44 V37.5 Z" fill="#57C7A4" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M27.5 45 L31 48.5 L37 41.5" fill="none" stroke="#0B0E14" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  )
}

/** 방패 아이콘 (칩/상세용) */
export function ShieldIcon({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size, flex: 'none' }}>
      <path d="M12 2 L21 5 V11 C21 16.5 17 20.5 12 22 C7 20.5 3 16.5 3 11 V5 Z" fill="#57C7A4" />
      <path d="M8.5 12 L11 14.5 L15.5 9.5" fill="none" stroke="#0B0E14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** 도감 생물 (40px) — 종목별 색·특징 */
export function CollectionCreature({ kind }: { kind: 'ss' | 'hd' | 'kia' | 'posco' | 'kakao' }) {
  const eyes = (
    <>
      <ellipse cx="15.5" cy="21" rx="2.6" ry="3" fill="#FFFFFF" />
      <ellipse cx="24.5" cy="21" rx="2.6" ry="3" fill="#FFFFFF" />
      <circle cx="16" cy="21.5" r="1.2" fill={INK} />
      <circle cx="24" cy="21.5" r="1.2" fill={INK} />
    </>
  )
  return (
    <svg viewBox="0 0 40 40" style={{ width: 40, height: 40 }}>
      {kind === 'ss' && (
        <>
          <circle cx="20" cy="23" r="13" fill="#FFC66E" stroke={INK} strokeWidth="1.4" />
          <path d="M20 10 Q17 4 12 6 Q16 8 17 11" fill="#7ED6A8" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          {eyes}
          <path d="M18.4 27 L21.6 27 L20 29.6 Z" fill="#E8574C" />
        </>
      )}
      {kind === 'hd' && (
        <>
          <circle cx="20" cy="23" r="13" fill="#7ED6A8" stroke={INK} strokeWidth="1.4" />
          <path d="M12 13 L10 6 L17 10 Z" fill="#7ED6A8" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M28 13 L30 6 L23 10 Z" fill="#7ED6A8" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          {eyes}
          <circle cx="20" cy="27" r="1.4" fill={INK} />
        </>
      )}
      {kind === 'kia' && (
        <>
          <circle cx="20" cy="23" r="13" fill="#7FA8E8" stroke={INK} strokeWidth="1.4" />
          <path d="M20 10 L20 4" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="20" cy="3.5" r="2.2" fill="#E8574C" />
          {eyes}
          <path d="M17 27 Q20 29.5 23 27" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
      {kind === 'posco' && (
        <>
          <circle cx="20" cy="23" r="13" fill="#F09A94" stroke={INK} strokeWidth="1.4" />
          <path d="M31 26 Q38 24 36 17" fill="none" stroke="#F09A94" strokeWidth="4" strokeLinecap="round" />
          {eyes}
          <path d="M18.4 27 L21.6 27 L20 29.6 Z" fill="#E8574C" />
        </>
      )}
      {kind === 'kakao' && (
        <>
          <circle cx="20" cy="23" r="13" fill="#B79BE8" stroke={INK} strokeWidth="1.4" />
          <path d="M20 10 Q23 4 28 6 Q24 8 23 11" fill="#7ED6A8" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          {eyes}
          <path d="M17 26.5 Q20 29 23 26.5" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

/** 열매 (40px) — 익음/시듦/대기 */
export function FruitSvg({ kind, size = 40 }: { kind: FruitKind; size?: number }) {
  return (
    <svg viewBox="0 0 44 44" style={{ width: size, height: size, display: 'block', margin: '0 auto' }}>
      {kind === 'ripe' && (
        <>
          <path d="M22 12 L22 5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M22 8 Q28 2 34 6 Q29 10 23 9" fill="#57C7A4" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          <circle cx="22" cy="27" r="13.5" fill="#E8574C" stroke={INK} strokeWidth="1.5" />
          <path d="M16 22 Q18 19.5 21 19.5" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {kind === 'wilt' && (
        <>
          <path d="M22 12 L22 5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M22 8 Q27 8 29 13 Q24 13.5 22 11" fill="#66707F" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          <circle cx="22" cy="27" r="13.5" fill="#4E5665" stroke={INK} strokeWidth="1.5" />
          <path d="M16 24 Q22 27 28 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
      {kind === 'pend' && (
        <>
          <path d="M22 14 L22 7" stroke="rgba(255,255,255,0.35)" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M22 10 Q27 5 32 8 Q28 12 23 11" fill="#57C7A4" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          <circle cx="22" cy="28" r="11" fill="rgba(87,199,164,0.1)" stroke="#57C7A4" strokeWidth="1.6" strokeDasharray="4 3" />
        </>
      )}
    </svg>
  )
}

/** 금고 (96px) — 다이얼 회전은 dialing 시 spin 애니메이션 */
export function VaultSvg({ dialing, dialDur }: { dialing: boolean; dialDur: number }) {
  return (
    <svg viewBox="0 0 96 96" style={{ width: 96, height: 96, display: 'block' }}>
      <rect x="4" y="4" width="88" height="88" rx="20" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.4" />
      <circle cx="15" cy="15" r="2" fill="rgba(255,255,255,0.25)" />
      <circle cx="81" cy="15" r="2" fill="rgba(255,255,255,0.25)" />
      <circle cx="15" cy="81" r="2" fill="rgba(255,255,255,0.25)" />
      <circle cx="81" cy="81" r="2" fill="rgba(255,255,255,0.25)" />
      <circle cx="48" cy="48" r="29" fill="#141925" stroke="rgba(255,255,255,0.16)" strokeWidth="1.4" />
      <g
        style={
          dialing
            ? {
                transformBox: 'fill-box',
                transformOrigin: 'center',
                animation: `spin ${dialDur}s linear infinite`,
              }
            : undefined
        }
      >
        <circle cx="48" cy="48" r="16.5" fill="#1D2432" stroke="rgba(255,255,255,0.35)" strokeWidth="1.6" />
        <path
          d="M48 33.5 L48 39 M62.5 48 L57 48 M48 62.5 L48 57 M33.5 48 L39 48 M58.2 37.8 L54.4 41.6 M58.2 58.2 L54.4 54.4 M37.8 58.2 L41.6 54.4 M37.8 37.8 L41.6 41.6"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <circle cx="48" cy="48" r="3" fill="#FA3B4A" />
      </g>
    </svg>
  )
}
