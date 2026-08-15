import type { CSSProperties } from 'react'

/** 숫자 전용 모노스페이스 (디자인 토큰: 숫자는 전부 tabular-nums) */
export const MONO = "ui-monospace,'SF Mono',Menlo,monospace"

export const monoNum: CSSProperties = {
  fontFamily: MONO,
  fontVariantNumeric: 'tabular-nums',
}

/** 글래스 카드 공통 */
export const glass: CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.11)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
}

export const RED_GRAD = 'linear-gradient(180deg,#FF5A66,#E93D4C)'

export const redCta: CSSProperties = {
  background: RED_GRAD,
  color: '#FFFFFF',
  fontWeight: 700,
  boxShadow: '0 8px 20px rgba(250,59,74,0.3)',
}

export const ghostBtn: CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.18)',
  color: '#F2F4F8',
  fontWeight: 700,
}
