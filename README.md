# 제주 도서관 도서 검색

제주도 도서관에서 도서를 검색할 수 있는 웹 애플리케이션입니다.

## 🚀 배포 방법

### 1. GitHub Pages + Vercel Functions 구조

- **GitHub Pages**: 정적 파일 호스팅 (HTML, CSS, JS)
- **Vercel Functions**: API 프록시 서버 (서버리스)

### 2. 배포 단계

#### 2-1. GitHub에 코드 업로드

```bash
# Git 저장소 초기화
git init

# 파일 추가
git add .

# 첫 번째 커밋
git commit -m "Initial commit: 제주 도서관 도서 검색 프로젝트"

# GitHub 저장소와 연결 (본인의 저장소 URL로 변경)
git remote add origin https://github.com/YOUR_USERNAME/jeju-book-finder.git

# 코드 푸시
git push -u origin main
```

#### 2-2. GitHub Pages 설정

1. GitHub 저장소로 이동
2. Settings → Pages
3. Source: "Deploy from a branch"
4. Branch: `main` / `/ (root)` 선택
5. Save

#### 2-3. Vercel Functions 배포

1. [Vercel](https://vercel.com) 회원가입/로그인
2. "New Project" → "Import Git Repository"
3. GitHub 저장소 선택
4. 프로젝트 이름: `jeju-book-finder-api`
5. Deploy 클릭

#### 2-4. API URL 업데이트

배포된 Vercel Functions URL을 확인하고 `index.html`에서 API URL 수정:

```javascript
// index.html의 214-217줄 부분
const apiUrl = window.location.hostname === 'localhost' 
    ? `http://localhost:3001/api/search?keyword=${encodedKeyword}&lib=${selectedLibraryCode}`
    : `https://YOUR_VERCEL_APP_URL/api/search?keyword=${encodedKeyword}&lib=${selectedLibraryCode}`;
```

### 3. 접근 URL

- **GitHub Pages**: `https://heyoni.github.io/jeju-book-finder/`
- **Vercel Functions**: `https://jeju-book-finder.vercel.app/api/search`

## 🛠️ 로컬 개발 환경

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 브라우저에서 index.html 열기
open index.html
```

## 📚 지원 도서관

- 한라도서관 (MJ)
- 우당도서관 (MK)
- 탐라도서관 (ML)
- 제주 기적의도서관 (MM)
- 애월도서관 (MP)

## 🔧 기술 스택

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express (Vercel Functions)
- **배포**: GitHub Pages + Vercel Functions
- **API**: 제주도 도서관 검색 API

## 📄 라이선스

MIT License
