# HOLD

참은 것을 기록하는 투자 앱. 수익률 대신, 계획대로 가고 있는지만 보여준다.

제품 정의는 [docs/PRD.md](docs/PRD.md) 참고.

## 시작하기

```bash
git clone https://github.com/Asher3576/HOLD.git
cd HOLD
pnpm install   # npm install도 가능
pnpm dev       # http://localhost:5173
```

`.env`에 Supabase 퍼블리셔블 키가 들어 있다(공개 안전 키라 커밋됨).
**시크릿 키(secret / service_role)는 절대 `.env`나 `VITE_` 변수에 넣지 말 것** — Vite는 `VITE_` 접두사 변수를 브라우저 번들에 그대로 노출한다.

## 명령어

```bash
pnpm dev        # 개발 서버
pnpm test       # 테스트 (Vitest)
pnpm typecheck  # 타입 체크
pnpm build      # 프로덕션 빌드
```

## 구조

```
src/
├── App.tsx                  # Phase A 셸 (목데이터 렌더)
├── app/
│   ├── components/          # UI (현재 스텁 — Phase A에서 본구현)
│   │   ├── holdie/          # 수호자 캐릭터 홀디
│   │   ├── Vault.tsx        # 금고 (계좌 요약 + 열람 마찰)
│   │   ├── EggShelf.tsx     # 알 선반 (계획 목록 + 진행률 + 블러)
│   │   ├── SellIntervene.tsx# 매도 개입 (본인 과거 기록 제시)
│   │   ├── PlanForm.tsx     # 알 만들기 (손절/익절/기간/이유)
│   │   ├── Collection.tsx   # 도감 + 열매
│   │   └── Review.tsx       # 말하는 복기
│   ├── lib/
│   │   ├── counterfactual.ts# 유령(반사실) 계좌 계산
│   │   ├── planMath.ts      # 진행률·블러·계획 이완 지수
│   │   └── supabase.ts      # Supabase 클라이언트 (Phase B)
│   └── mock/data.ts         # Phase A 목데이터
supabase/
├── migrations/              # DB 스키마 (Phase B에서 적용)
└── functions/
    ├── ai/                  # 논지 레이더·복기 (Phase C)
    └── prices/              # 시세 수집·열매 채점 (Phase C)
```

## 단계

- **Phase A (현재)**: 프론트 단독 + 목데이터. 홀디·금고·알 UI 본구현.
- **Phase B**: Supabase 연결 — `supabase link --project-ref xpjtgmckrazfbyghkeve` 후 `supabase db push`로 마이그레이션 적용, Auth 연동.
- **Phase C**: 엣지 함수(ai/prices) 구현 + 시세 수집·채점 크론.

## 원칙

- 사용자 API 키를 받지 않는다. 실거래를 지원하지 않는다.
- AI는 절대 사라/팔라를 말하지 않는다.
- 홀디는 사용자를 혼내지 않는다 (실망·비난 표정 금지).
