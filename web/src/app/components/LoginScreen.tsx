import { useState } from 'react'
import Holdie from './holdie/Holdie'
import { ghostBtn, redCta } from '../ui'

/** 로그인/회원가입 — 폰 셸 안에 표시. 게스트(목데이터 데모) 입장도 제공. */
export default function LoginScreen({
  busy,
  onSignIn,
  onSignUp,
  onGuest,
}: {
  busy: boolean
  onSignIn: (email: string, pw: string) => void
  onSignUp: (email: string, pw: string) => void
  onGuest: () => void
}) {
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const canSubmit = email.includes('@') && pw.length >= 6 && !busy

  const inputCss: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    outline: 'none',
    borderRadius: 12,
    padding: '13px 14px',
    color: '#F2F4F8',
    fontSize: 14,
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 24px 40px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Holdie pose="idle" size={96} />
        <div style={{ marginTop: 14, fontFamily: "ui-monospace,'SF Mono',Menlo,monospace", fontSize: 18, fontWeight: 800, letterSpacing: 6 }}>
          HOLD
        </div>
        <div style={{ marginTop: 6, fontSize: 12.5, color: '#99A1B3', textAlign: 'center', lineHeight: 1.6 }}>
          수익률 대신, 계획대로 가고 있는지만.
          <br />
          홀디가 네 계획을 지켜줄게.
        </div>
      </div>

      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          autoComplete="email"
          style={inputCss}
        />
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="비밀번호 (6자 이상)"
          autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canSubmit) (mode === 'in' ? onSignIn : onSignUp)(email, pw)
          }}
          style={inputCss}
        />
        <button
          onClick={() => (mode === 'in' ? onSignIn(email, pw) : onSignUp(email, pw))}
          disabled={!canSubmit}
          style={{
            height: 50,
            borderRadius: 14,
            fontSize: 14,
            ...redCta,
            ...(canSubmit ? {} : { opacity: 0.4, cursor: 'not-allowed' }),
          }}
        >
          {busy ? '잠시만…' : mode === 'in' ? '로그인' : '회원가입'}
        </button>
        <button
          onClick={() => setMode(mode === 'in' ? 'up' : 'in')}
          style={{ fontSize: 12.5, color: '#99A1B3', padding: 6 }}
        >
          {mode === 'in' ? '처음이에요 — 회원가입' : '계정이 있어요 — 로그인'}
        </button>
      </div>

      <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
        <span style={{ fontSize: 10.5, color: '#5A6170' }}>또는</span>
        <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
      </div>

      <button onClick={onGuest} style={{ marginTop: 14, height: 46, borderRadius: 14, fontSize: 13, ...ghostBtn }}>
        게스트로 둘러보기 (데모 데이터)
      </button>
      <div style={{ marginTop: 12, textAlign: 'center', fontSize: 10, color: '#5A6170', lineHeight: 1.6 }}>
        실거래 없음 · 사용자 증권사 API 키를 받지 않아요
      </div>
    </div>
  )
}
