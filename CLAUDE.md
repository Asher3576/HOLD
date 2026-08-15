# HOLD — 에이전트 하네스

이 문서는 HOLD 코드베이스에서 작업하는 AI 에이전트(그리고 사람)의 하네스다.
**제품 규칙은 문서가 아니라 코드(테스트)로 고정한다** — 규칙을 바꾸려면 테스트를 함께 바꿔야 한다.

## 제품 불변식 (위반하는 코드는 머지 금지)

1. **수익률 숫자(%, 원)는 금고 안에서만.** 알 선반·매도 기록·열매·차트 어디에도 수익률·평가금액을 노출하지 않는다. 차트는 시세만.
2. **AI는 절대 사라/팔라를 말하지 않는다.** 사실·조건문만. LLM 출력은 `@hold/shared`의 `violatesInvestmentSignal` 필터를 통과해야 화면에 나간다. (`shared/src/__tests__/compliance.test.ts`가 계약)
3. **캐릭터(인사이트 프렌즈)는 비난하지 않는다.** bull(황소·메인/지킴)·bear(곰·걱정/경고)·owl(부엉이·분석) 3종 — bear의 "걱정"까지만 허용, 실망/조롱 표정 추가 금지. 아트는 `web/src/app/components/insight/stock-characters.js` 원본 수정 금지.
4. **실거래 없음.** 주문 API·사용자 증권사 API 키를 절대 받지 않는다. 매수/매도는 전부 모의(가상 장부).
5. **손절 작동 = 보험이 일한 것.** 실패로 표현하는 카피 금지.
6. **goal-gradient 방어.** 진행률 80% 초과 시 게이지·차트 블러 유지 (`shouldBlur`, `BLUR_THRESHOLD`).
7. **시크릿을 `VITE_` 변수·클라이언트 코드에 넣지 않는다.** 퍼블리셔블/anon 키만 허용. 스크린샷·원본 화면 데이터는 저장하지 않는다.

## Definition of Done

모든 변경은 루트에서 아래 3개가 전부 통과해야 커밋한다:

```bash
pnpm typecheck && pnpm test && pnpm build
```

- 새 제품 규칙·계산 로직은 **shared에 순수 함수 + Vitest 테스트**로 먼저 고정하고 UI에서 사용한다.
- UI 문구로만 존재하는 규칙을 만들지 말 것 — 규칙은 테스트가 지킨다.
- 실데이터 경로를 추가할 때는 반드시 **목데이터 폴백**을 유지한다 (미배포·네트워크 실패에도 앱은 동작).

## 아키텍처 맵

```
web/        Vite+React 앱 (모바일 375 기준, 반응형)
  src/app/useHold.ts        상태·타이머·모의장부 — 로직은 여기 집중, 컴포넌트는 표시만
  src/app/lib/api.ts        시세 페치 (prices 엣지) + 목 폴백
  src/app/mock/             목데이터 (실데이터 실패 시의 진실)
shared/     @hold/shared — 순수 로직 + 테스트 (planMath·counterfactual·rr·compliance)
extension/  크롬 확장 MV3 스켈레톤 (esbuild). activeTab만, 상시 주입 금지
supabase/
  functions/prices/  시세 프록시: HOLD → 스토커스클럽 엣지 → 토스증권 (서버-서버)
  functions/ta|vision|ai/  Phase C — ta=결정적 계산(LLM 금지), ai=문장만(수치는 인용)
  migrations/        스키마. 적용은 대시보드 SQL Editor 또는 supabase db push
```

데이터 흐름: 시세는 `prices` 함수가 유일한 입구. 프론트가 외부 API를 직접 부르지 않는다.

## 명령어

```bash
pnpm dev                              # 웹앱 (localhost:5173)
pnpm --filter @hold/extension build   # 확장 → extension/dist
pnpm --filter @hold/shared test       # 로직 테스트만
```

## 배포

- 웹: main 푸시 → Vercel 자동 배포 (Root Directory=web)
- 엣지 함수: 대시보드 Edge Functions 에디터 또는 `supabase functions deploy prices --no-verify-jwt`
  - `prices`는 JWT 검증 OFF (퍼블리셔블 키는 JWT가 아님)
- DB: `supabase/migrations/`가 진실. 대시보드 SQL Editor로 적용 시에도 같은 파일 내용을 실행

## 커밋 규칙

- 한국어 커밋 메시지, 본문에 변경 요점 불릿.
- 모델 ID·내부 도구명은 커밋/코드에 넣지 않는다.
