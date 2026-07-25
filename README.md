# ProShot — 셀카 한 장으로 AI 프로필 사진

> AI가 셀카 한 장을 전문 헤드샷으로 변환해 주는 웹 앱

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS |
| AI 모델 | Google Gemini API (`@google/genai`) |
| 배포 | Vercel |

## 프로젝트 구조

```
proshot/
├── app/
│   ├── api/generate/route.ts   ← Gemini API 서버리스 라우트
│   ├── components/
│   │   └── UploadCard.tsx      ← 업로드 + 결과 비교 UI
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                ← 랜딩 페이지
├── .env.example                ← 환경변수 템플릿
├── .env.local                  ← 로컬 개발용 (git 미포함)
└── package.json
```

## 환경변수

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `GEMINI_API_KEY` | Google Gemini API 키 | ✅ |

> ⚠️ **절대 코드에 API 키를 직접 입력하거나 Git에 커밋하지 마세요!**

### API 키 발급 방법

1. [Google AI Studio](https://aistudio.google.com/) 접속
2. 로그인 후 **API Keys** 메뉴에서 키 생성
3. 생성된 키를 `.env.local` 파일 또는 Vercel 환경변수에 등록

---

## 로컬 개발

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 열고 GEMINI_API_KEY= 뒤에 실제 키를 입력

# 3. 개발 서버 실행
npm run dev

# 4. 브라우저에서 확인
# http://localhost:3000
```

---

## Vercel 배포

### 방법 1: GitHub 연동 (추천)

```bash
# 1. GitHub에 코드 푸시
git add .
git commit -m "ProShot: Vercel 배포 준비 완료"
git push origin main
```

1. [vercel.com](https://vercel.com) 접속 → 로그인
2. **"Add New..."** → **"Project"** 클릭
3. GitHub 저장소 **`abraxass0511-lab/proshot`** 선택 → **Import**
4. **Framework Preset**: `Next.js` (자동 감지됨)
5. **Environment Variables** 섹션에서:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: 실제 Gemini API 키 붙여넣기
   - **"Add"** 클릭
6. **"Deploy"** 클릭

> 🎉 배포 완료! `https://proshot-xxxx.vercel.app` 주소가 생성됩니다.

### 방법 2: Vercel CLI

```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 로그인
vercel login

# 3. 프로젝트 연결 및 배포
vercel

# 4. 프로덕션 배포
vercel --prod
```

> CLI로 배포할 때도 **반드시** Vercel 대시보드에서 환경변수를 설정해야 합니다.

### 환경변수 설정 (Vercel 대시보드)

1. [Vercel Dashboard](https://vercel.com/dashboard) → 프로젝트 선택
2. **Settings** → **Environment Variables**
3. 추가:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: 실제 API 키
   - **Environment**: ✅ Production, ✅ Preview, ✅ Development 모두 체크
4. **Save** 클릭
5. **Deployments** → 최신 배포 → **⋮** → **Redeploy** (환경변수 적용)

---

## API 라우트 정보

| 항목 | 값 |
|------|-----|
| 경로 | `POST /api/generate` |
| 런타임 | `nodejs` (Edge 아님 — Buffer 사용) |
| 최대 실행 시간 | 60초 |
| AI 모델 | `gemini-2.0-flash-exp` |
| BYOK 지원 | ✅ `x-gemini-key` 헤더로 사용자 키 전달 가능 |

---

## 기능 요약

- 📸 **셀카 업로드**: 드래그 앤 드롭 또는 클릭, 8MB 이하 JPG/PNG/WebP
- 🎨 **3가지 스타일**: 비즈니스 정장 / 스튜디오 / 야외 자연광
- ⚡ **AI 헤드샷 생성**: Google Gemini API로 실시간 변환
- 🔄 **Before/After 비교**: 원본과 AI 결과를 나란히 비교
- 📥 **PNG 다운로드**: 결과 이미지를 `proshot-headshot.png`로 저장
- 🔑 **BYOK 모드**: 무료 2회 체험 후, 자신의 Gemini API 키로 무제한 사용
- 📱 **반응형 디자인**: 모바일 완벽 지원

---

## 라이선스

AI CITY BUILDERS © 2026
