import type { Fruit } from '../model'
import { baseFruits } from '../mock/design'
import { glass, monoNum } from '../ui'
import { CollectionCreature, FruitSvg } from './svg'

/** 컬렉션 — 부화 도감 + 열매 저장고 + 반사실 곡선 */
export default function CollectionCards({
  hatchN,
  hatchRate,
  hatch5,
  fruitsExtra,
  fruitTotal,
}: {
  hatchN: number
  hatchRate: number
  hatch5: boolean
  fruitsExtra: Fruit[]
  fruitTotal: number
}) {
  const fruits = [...fruitsExtra, ...baseFruits]
  const dex: Array<{ kind: 'ss' | 'hd' | 'kia' | 'posco'; name: string; lv: number }> = [
    { kind: 'ss', name: '삼성전자', lv: 2 },
    { kind: 'hd', name: '현대차', lv: 1 },
    { kind: 'kia', name: '기아', lv: 1 },
    { kind: 'posco', name: 'POSCO', lv: 1 },
  ]
  return (
    <div style={{ marginTop: 26 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#7A8296' }}>컬렉션</div>

      {/* 부화 도감 */}
      <div style={{ marginTop: 10, borderRadius: 18, padding: 14, ...glass }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>부화 도감</span>
          <span style={{ ...monoNum, fontSize: 11, color: '#7A8296' }}>
            부화 {hatchN}마리 · 완주율 {hatchRate}%
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
          {dex.map((c) => (
            <div key={c.kind} style={{ width: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <CollectionCreature kind={c.kind} />
              <span style={{ fontSize: 9, lineHeight: 1.35, color: '#99A1B3', textAlign: 'center' }}>
                {c.name}
                <br />
                Lv.{c.lv}
              </span>
            </div>
          ))}
          {hatch5 && (
            <div
              style={{
                width: 56,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                animation: 'popIn 0.5s cubic-bezier(0.34,1.4,0.64,1)',
              }}
            >
              <CollectionCreature kind="kakao" />
              <span style={{ fontSize: 9, lineHeight: 1.35, color: '#99A1B3', textAlign: 'center' }}>
                카카오
                <br />
                Lv.1
              </span>
            </div>
          )}
        </div>
        <div style={{ marginTop: 11, fontSize: 10, lineHeight: 1.55, color: '#7A8296' }}>
          계획 완주 = 부화. 부화한 종목을 다시 품으면 알 대신{' '}
          <span style={{ color: '#FFC66E', fontWeight: 700 }}>사육</span> — 완주할 때마다 Lv이 올라.
        </div>
      </div>

      {/* 열매 저장고 */}
      <div style={{ marginTop: 10, borderRadius: 18, padding: 14, ...glass }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>열매 저장고</span>
          <span style={{ ...monoNum, fontSize: 11, color: '#7A8296' }}>총 {fruitTotal}개</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 12 }}>
          {fruits.map((f, i) => (
            <div
              key={`${f.name}-${i}`}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 14,
                padding: '12px 6px 10px',
                animation: f.kind === 'pend' ? 'popIn 0.5s ease' : undefined,
              }}
            >
              <FruitSvg kind={f.kind} />
              <div style={{ marginTop: 7, fontSize: 11, fontWeight: 700, textAlign: 'center' }}>
                {f.name}
              </div>
              <div
                style={{
                  ...monoNum,
                  marginTop: 2,
                  fontSize: 10,
                  fontWeight: 600,
                  textAlign: 'center',
                  color:
                    f.kind === 'pend' ? '#57C7A4' : f.dir.includes('하락') ? '#7FA8E8' : '#E36A5C',
                }}
              >
                {f.dir}
              </div>
              <div style={{ marginTop: 2, fontSize: 9.5, lineHeight: 1.4, textAlign: 'center', color: '#7A8296' }}>
                {f.note}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 11, fontSize: 10, lineHeight: 1.55, color: '#7A8296' }}>
          열매 = 팔고 싶을 때 참은 기록. 30일 뒤 방향으로 익거나 시들어 — 숫자는 안 보여줘.
        </div>
      </div>

      {/* 반사실 곡선 */}
      <div style={{ marginTop: 10, borderRadius: 18, padding: 14, ...glass }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>계획을 지켰다면</div>
        <svg viewBox="0 0 320 150" style={{ width: '100%', height: 'auto', display: 'block', marginTop: 8 }}>
          <g style={{ opacity: 0, animation: 'ghostFade 0.5s ease 1.45s forwards' }}>
            <path
              d="M130,99 L168,90 L206,82 L248,70 L308,54 L308,117 L258,124 L228,109 L202,105 L164,112 Z"
              fill="rgba(122,130,150,0.14)"
              stroke="none"
            />
            <circle cx="130" cy="99" r="4" fill="#0B0E14" stroke="#7A8296" strokeWidth="1.5" />
            <circle cx="228" cy="109" r="4" fill="#0B0E14" stroke="#7A8296" strokeWidth="1.5" />
            <text x="130" y="145" textAnchor="middle" fontSize="9" fill="#7A8296">
              계획 외 매도
            </text>
            <text x="240" y="145" textAnchor="middle" fontSize="9" fill="#7A8296">
              계획 외 매도
            </text>
          </g>
          <path
            d="M12,124 L58,116 L96,106 L130,99 L168,90 L206,82 L248,70 L308,54"
            fill="none"
            stroke="#7A8296"
            strokeWidth="1.5"
            strokeDasharray="5 5"
            strokeDashoffset={620}
            style={{ animation: 'ghostDraw 1.6s ease 0.3s forwards' }}
          />
          <path
            d="M12,124 L58,116 L96,106 L130,99 L164,112 L202,105 L228,109 L258,124 L308,117"
            fill="none"
            stroke="#57C7A4"
            strokeWidth="2"
            style={{
              strokeDasharray: 620,
              strokeDashoffset: 620,
              animation: 'ghostDraw 1.6s ease 0.1s forwards',
            }}
          />
        </svg>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ width: 16, height: 2, background: '#57C7A4' }} />
            <span style={{ fontSize: 11, color: '#99A1B3' }}>실제</span>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ width: 16, borderTop: '2px dashed #7A8296' }} />
            <span style={{ fontSize: 11, color: '#99A1B3' }}>계획대로였다면</span>
          </div>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: '#5A6170' }}>금액은 금고 안에서</span>
        </div>
      </div>
    </div>
  )
}
