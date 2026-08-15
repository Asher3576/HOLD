# HOLD

참은 것을 기록하는 투자 앱. 수익률 대신, 계획대로 가고 있는지만 보여준다.
크롬 확장으로 충동이 생기는 현장(남의 차트 위)까지 간다.

제품 정의는 [docs/PRD.md](docs/PRD.md) 참고.

## 시작하기

```bash
git clone https://github.com/Asher3576/HOLD.git
cd HOLD
pnpm install
pnpm dev        # 웹앱 — http://localhost:5173
```

`web/.env`에 Supabase 퍼블리셔블 키가 들어 있다(공개 안전 키라 커밋됨).
**시크릿 키(secret / service_role)는 절대 `.env`나 `VITE_` 변수에 넣지 말 것** — Vite는 `VITE_` 접두사 변수를 브라우저 번들에 그대로 노출한다.

## 명령어 (루트에서)

```bash
pnpm dev        # 웹앱 개발 서버
pnpm test       # 전 패키지 테스트 (Vitest)
pnpm typecheck  # 전 패키지 타입 체크
pnpm build      # 전 패키지 빌드 (확장은 extension/dist/)
```

크롬 확장 로드 방법은 [extension/README.md](extension/README.md) 참고.

## 구조 (pnpm 모노레포)

```
web/                         # 웹앱 (Vite + React 18 + TS)
├── src/App.tsx              # Phase A 셸 (목데이터 렌더)
└── src/app/
    ├── components/          # UI 스텁 — 홀디/금고/알선반/매도개입/도감/복기
    ├── lib/supabase.ts      # Supabase 클라이언트 (Phase B)
    └── mock/data.ts         # Phase A 목데이터
extension/                   # 크롬 확장 (Manifest V3, esbuild)
└── src/
    ├── background.ts        # 캡처·API 중계 서비스 워커
    ├── content/             # 차트 위 오버레이 (지지/저항 선)
    └── popup/               # 홀디 팝업
shared/                      # @hold/shared — 순수 로직 + 테스트
└── src/
    ├── planMath.ts          # 진행률·블러·계획 이완 지수
    ├── counterfactual.ts    # 유령(반사실) 계좌
    └── rr.ts                # 손익비·적중률 (확장 코치의 핵심)
supabase/
├── migrations/              # 스키마 (Phase B에서 적용) — 앱 + 확장 테이블
└── functions/
    ├── ta/                  # 결정적 TA: 스윙 레벨·ADX·손익비 (LLM 없음)
    ├── vision/              # 스크린샷 → 축 캘리브레이션만 (원본 즉시 폐기)
    ├── ai/                  # LLM 문장 생성: 브리핑·복기 (수치는 인용만)
    └── prices/              # 캔들 수집·채점 크론
```

## 단계

- **Phase A (현재)**: 앱 UI 본구현 — 홀디·금고·알 선반 (목데이터).
- **Phase B**: Supabase 연결 — `supabase link --project-ref xpjtgmckrazfbyghkeve` 후 `supabase db push`, Auth 연동.
- **Phase C**: AI 복기·논지 레이더 + 시세 크론 + 채점.
- **Ext-1**: 오버레이+브리핑 (심볼 URL 파싱, 수동 보정) · **Ext-2**: 비전 캘리브레이션 · **Ext-3**: 라이브 코멘트.

## 원칙

- 사용자 API 키를 받지 않는다. 실거래를 지원하지 않는다.
- AI는 절대 사라/팔라를 말하지 않는다 — 수치는 서버가 결정적으로, LLM은 문장만.
- 스크린샷 원본은 저장하지 않는다. DOM을 읽지 않는다. 상시 주입하지 않는다.
- 홀디는 사용자를 혼내지 않는다 (실망·비난 표정 금지).
