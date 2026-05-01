# 결제 시스템 셋업 가이드 — RevenueCat × App Store Connect

코드 쪽은 다 완성됐고, **외부 등록 작업** 만 남았어. 1~2시간 작업.

## 0️⃣ 사전 준비
- [ ] Apple Developer 계정 (개인 ₩129,000/년 또는 법인)
- [ ] Banking + Tax 정보 등록 완료 (Apple "Ready to Submit" 상태)
- [ ] App Store Connect 에 "MintMoody" 앱 생성 (Bundle ID `com.mintmoody.app`)

## 1️⃣ App Store Connect 에서 구독 상품 등록

### 1-1. 로그인 → My Apps → MintMoody → 좌측 메뉴 "**Subscriptions**"

### 1-2. **Subscription Group 생성**
- Reference Name: `MintMoody Premium`
- Display Name: `프리미엄`

### 1-3. 그룹 안에 구독 2개 만들기

#### 월간
- Product ID: `mintmoody.monthly`
- Reference Name: `MintMoody 월간 구독`
- Subscription Duration: **1 Month**
- Price (Korea): **₩5,500**
  - "View All Pricing" 누르면 다른 국가 자동 환율 변환됨 (검토 후 OK)
- Localization (필수):
  - 한국어: 이름 "프리미엄 월간", 설명 "모든 기능 · 무광고 · 무제한 12시간 재생"
  - 영어: name "Premium Monthly", description "All features, no ads, 12-hour unlimited playback"
- Review Information: 내부 노트 + 스크린샷 (Subscribe 페이지 캡처)

#### 연간
- Product ID: `mintmoody.yearly`
- Reference Name: `MintMoody 연간 구독`
- Subscription Duration: **1 Year**
- Price (Korea): **₩49,000**
- Localization 동일 (이름 "프리미엄 연간" 등)

### 1-4. **In-App Purchase Key 생성**
- App Store Connect → Users and Access → Integrations → "**In-App Purchase**" 탭
- "**Generate In-App Purchase Key**" → 이름 `RevenueCat`
- `.p8` 파일 다운로드 (한 번만 가능 — 분실 시 재발급)
- **Issuer ID** 복사 (페이지 상단)
- **Key ID** 복사 (생성된 키)

### 1-5. **Subscription Group Reference**
- 위 Subscription 페이지 우측에서 Group ID 복사 (RevenueCat 에 입력)

## 2️⃣ RevenueCat 셋업

### 2-1. https://app.revenuecat.com 가입 (무료, 매출 $2.5K/월까지)

### 2-2. **+ New Project** → 이름 `MintMoody`

### 2-3. **Apps** 메뉴 → **+ Add App** → **App Store**
- App Name: MintMoody
- Bundle ID: `com.mintmoody.app`
- App Store Connect Shared Secret: 비워둠 (다른 방식 사용)
- **App Store Connect API Key** (위 1-4 에서 받은 거):
  - Issuer ID: 붙여넣기
  - Key ID: 붙여넣기
  - .p8 파일 업로드

### 2-4. **Products** 메뉴 → **+ New** 두 개
- `mintmoody.monthly` (Subscription)
- `mintmoody.yearly` (Subscription)

### 2-5. **Entitlements** 메뉴 → **+ New**
- Identifier: `premium` ⚠️ (코드에 박혀있는 값과 일치해야 함)
- Attached Products: 위 2개 다 추가

### 2-6. **Offerings** 메뉴 → **+ New** → 이름 `default`
- Packages 추가:
  - Identifier `$rc_monthly` → `mintmoody.monthly`
  - Identifier `$rc_annual` → `mintmoody.yearly`
- "**Make Current**" 체크 ⚠️ 필수

### 2-7. **API Keys** (Project Settings → API Keys)
- Public app-specific keys 의 iOS 행에서 키 복사
- 앞에 `appl_` 시작하는 그거

## 3️⃣ 환경변수 등록

### Lovable
- Lovable 대시보드 → Project → Environment Variables
- `VITE_REVENUECAT_IOS_KEY` = 위 2-7 에서 복사한 키 (`appl_...`)

### 로컬 개발 (.env, git 안 올라감)
```bash
VITE_REVENUECAT_IOS_KEY="appl_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

## 4️⃣ 빌드 + TestFlight 테스트

```bash
npm run build
npx cap sync ios
npx cap open ios
```

Xcode 에서:
1. **Signing & Capabilities** → "Add Capability" → **In-App Purchase** 추가
2. **Product → Archive** → Upload to App Store Connect
3. App Store Connect → TestFlight → Sandbox 사용자 추가 (Settings → 본인 Apple ID 로그아웃 → TestFlight 앱에서 Sandbox 계정으로 로그인)
4. TestFlight 빌드에서 Subscribe 페이지 → 구독 버튼 → 진짜 결제창 뜨면 OK ✅

## 5️⃣ 정식 출시 전 체크
- [ ] 월간 / 연간 둘 다 결제 됨
- [ ] 구독 후 isPremium = true 됨 (모든 자물쇠 풀림)
- [ ] 다른 기기에서 "구매 복원" 눌러서 복구 됨
- [ ] 구독 해지 시 다음 갱신일 후 isPremium = false 됨 (App Store 시뮬레이터 가속 가능)
- [ ] 친구 / 베타 사용자한테 무료 제공: Admin 페이지에서 직접 `is_premium = true` 부여

## 🚨 흔한 함정
- Product ID 가 코드 / RevenueCat / App Store Connect 셋이 정확히 일치해야 함
- Entitlement ID 는 `premium` 으로 통일 (코드 내 `ENTITLEMENT_ID` 와 RevenueCat)
- Subscription 이 "Approved" 상태여야 RevenueCat 에서 Offerings 가 보임 (Apple 검토 필요)
- TestFlight 빌드는 *Sandbox 결제*, 실제 카드 안 긁힘
