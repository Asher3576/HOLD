import type { Egg, Fruit, NewsItem, SellRec } from '../model'

/** 초기 알 선반 5개 (v5 목데이터) */
export const initialEggs: Egg[] = [
  {
    id: 'ss',
    name: '삼성전자',
    qty: '50주',
    stop: 7,
    target: 15,
    days: 60,
    elapsed: 41,
    prog: 62,
    stage: 'creature',
    lv: 2,
    reason: '3분기 실적 서프라이즈 예상',
    memoL: '9월 4일의 너',
    memoQ: '3분기 실적 서프라이즈, 3개월 본다',
  },
  {
    id: 'sk',
    name: 'SK하이닉스',
    qty: '20주',
    stop: 8,
    target: 20,
    days: 30,
    elapsed: 12,
    prog: 85,
    stage: 'crack',
    reason: 'HBM 수요 증가',
    memoL: '9월 22일의 너',
    memoQ: 'HBM 수요 증가, 한 달은 본다',
  },
  { id: 'nv', name: 'NAVER', qty: '10주', stage: 'wild' },
  {
    id: 'kk0',
    name: '카카오',
    qty: '30주',
    stop: 5,
    target: 10,
    days: 30,
    elapsed: 30,
    prog: 48,
    stage: 'expiry',
    reason: '신사업 발표 기대',
    memoL: '10월 1일의 너',
    memoQ: '신사업 발표 기대',
  },
  { id: 'lg', name: 'LG에너지솔루션', qty: '5주', stage: 'shield' },
]

/** 부화 이력 — 새 계획 생성 시 조회해 알/사육 결정 */
export const initialHatchedMap: Record<string, number> = {
  삼성전자: 2,
  현대차: 1,
  기아: 1,
  POSCO: 1,
}

const dimHeads = [
  '코스피, 외국인 매도에 약보합 마감',
  '원/달러 환율 1,340원대 등락',
  '미 10년물 금리 소폭 상승',
  '4분기 반도체 업황 전망 엇갈려',
  '2차전지주, 기관 차익실현에 혼조',
  '유가, 중동 불안에 배럴당 84달러',
  '코스닥, 개인 순매수 지속',
  '기준금리 동결 전망 우세',
  '엔화 약세에 수출주 수혜 기대',
  '미 고용지표 발표 앞두고 관망세',
  '제약바이오, 임상 결과 발표 앞둬',
  '건설주, 해외 수주 소식에 강세',
  '통신 3사, 요금제 개편 발표',
]

/** 뉴스 14건: 1건 논지 관련 + 13건 무관 */
export const newsItems: NewsItem[] = [
  { tag: '논지 관련', headline: '○○사, HBM 공급 계약 체결 발표', rel: true },
  ...dimHeads.map((h) => ({ tag: '무관', headline: h, rel: false })),
]

/** 과거 매도 12건 — 방향만, 수익률 숫자 없음 */
export const sellRecData: SellRec[] = [
  { n: '삼성전자', d: '3월 12일', up: true },
  { n: 'SK하이닉스', d: '4월 2일', up: true },
  { n: 'NAVER', d: '4월 25일', up: true },
  { n: '카카오', d: '5월 9일', up: false },
  { n: '현대차', d: '5월 30일', up: true },
  { n: '기아', d: '6월 14일', up: false },
  { n: 'POSCO', d: '7월 1일', up: true },
  { n: 'LG전자', d: '7월 19일', up: true },
  { n: '삼성SDI', d: '8월 6일', up: false },
  { n: '셀트리온', d: '8월 22일', up: true },
  { n: '두산에너빌리티', d: '9월 5일', up: true },
  { n: '한화에어로', d: '9월 26일', up: false },
]

export const baseFruits: Fruit[] = [
  { name: '삼성전자', kind: 'ripe', dir: '30일 뒤 상승', note: '참길 잘했어' },
  { name: 'SK하이닉스', kind: 'wilt', dir: '30일 뒤 하락', note: '이번엔 파는 게 나았네' },
  { name: 'NAVER', kind: 'ripe', dir: '30일 뒤 하락', note: '사려다 참음 — 안 사길 잘했어' },
]

/** 확장 데모 차트 종가 24봉 (TSLA) */
export const chartCloses = [
  224, 226, 225, 228, 231, 229, 233, 236, 234, 238, 241, 239.4, 237, 240.6, 238,
  241, 239, 236.4, 238, 240, 237, 234, 236, 235.6,
]

export const chartVolH = [
  22, 18, 24, 20, 16, 19, 25, 21, 17, 23, 26, 22, 18, 20, 15, 17, 14, 12, 13,
  11, 10, 9, 8, 7,
]
