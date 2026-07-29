# 🚀 MathAI Tutor - 초등 수학 평가 AI 웹 앱 배포 가이드

본 프로젝트는 **Vercel 풀스택 서버리스 배포 설정(`vercel.json`)**이 완벽하게 완료된 상태입니다.

---

## 🌐 1. Vercel + GitHub 무료 배포 방법 (가장 쉽고 추천!)

### Step 1: GitHub에 코드 올리기
1. [GitHub](https://github.com)에 접속하여 새 저장소(New Repository)를 만듭니다. (예: `math-ai-tutor`)
2. 프로젝트 폴더(`C:\Users\PC\.gemini\antigravity\scratch\math_eval_app`)에서 터미널을 열고 아래 커맨드를 입력합니다:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for MathAI Tutor"
   git branch -M main
   git remote add origin https://github.com/당신의계정/math-ai-tutor.git
   git push -u origin main
   ```

### Step 2: Vercel에서 원클릭 배포
1. [Vercel](https://vercel.com)에 깃허브 계정으로 1초 로그인합니다.
2. **[Add New...] ➔ [Project]** 버튼을 클릭합니다.
3. 방금 올린 `math-ai-tutor` 깃허브 저장소를 선택(Import)합니다.
4. **Environment Variables (환경 변수)** 항목에 다음을 입력합니다:
   - Key: `GEMINI_API_KEY`
   - Value: `YOUR_GEMINI_API_KEY`
5. **[Deploy]** 버튼을 클릭하면 약 30초 후 나만의 무료 웹사이트 주소 (`https://math-ai-tutor.vercel.app`)가 즉시 발급됩니다! 🎉

---

## 💻 2. Vercel CLI 터미널 직통 배포 방법

프로젝트 폴더에서 아래 명령어를 실행하면 브라우저 로그인 후 즉시 인터넷에 배포됩니다:
```bash
npx vercel
```

---

## 🔑 배포 후 접속 주소

- **학생용 풀이 접속 주소**: `https://당신의프로젝트.vercel.app`
- **교사 통합 대시보드 주소**: `https://당신의프로젝트.vercel.app/admin` (비밀번호: `0000`)
