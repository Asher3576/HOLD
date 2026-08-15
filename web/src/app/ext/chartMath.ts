/**
 * 확장 데모 차트 좌표 변환.
 * viewBox 640×380 (세로 스케일 1:1 — 컨테이너 높이 380px 고정).
 * 가격 범위 218~256 ↔ y 360~20.
 */
export function p2y(p: number): number {
  return Math.round((20 + (256 - p) * (340 / 38)) * 10) / 10
}

export function y2p(y: number): number {
  return 256 - (y - 20) / (340 / 38)
}
