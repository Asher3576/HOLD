/** 인사이트 프렌즈 렌더러 타입 (아트 원본은 stock-characters.js — 수정 금지) */
export type CharName = 'bull' | 'bear' | 'owl'

export interface CharOpts {
  /** 높이 px (기본 200). 풀바디는 400:440 비율, head는 정사각형 */
  size?: number
  variant?: 'full' | 'head'
  /** bull 전용 — 다른 캐릭터는 무시 */
  mood?: 'calm' | 'excited'
  doodles?: boolean
  doodleColor?: string
}

export function svg(name: CharName, opts?: CharOpts): string
export function mount(el: string | Element, name: CharName, opts?: CharOpts): SVGElement
export const characters: CharName[]
