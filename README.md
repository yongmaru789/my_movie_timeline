# my_movie_timeline

영화 감상 기록을 저장하고 관리할 수 있는 웹 프로젝트.    
Spring Boot 백엔드 학습을 목적으로 개발한 학습용 프로젝트입니다.

---   

## 기술 스택

**Frontend**
- React + Vite
- Tailwind CSS
- React Router
- react-markdown 

**Backend**
- Spring Boot 3
- Spring Security + JWT
- Spring Data JPA
- MySQL

**External API**
- TMDB API (영화 검색)
- Claude API (AI 영화 추천)

---   

## 주요 기능

### 영화 관리
- TMDB API 연동을 통한 실시간 영화 검색 및 등록
- 영화 등록 / 수정 / 삭제 (CRUD)
- 최신순 / 오래된순 정렬
- 제목 기반 검색 (전체 영화 대상)
- 페이지네이션

### 별점
- 클릭/호버 방식의 별점 입력 (0.5점 단위)

### 타임라인
- 연도 / 월별로 그룹화된 감상 기록 시각화
- 연도별 감상 편수 표시

### 인증
- 회원가입 / 로그인 (JWT 기반)
- 로그인한 사용자 본인의 영화만 조회
- JWT 토큰 만료 시 자동 로그아웃
- 비로그인 상태에서 접근 시 로그인 페이지로 리다이렉트

### AI 영화 추천
- 별점 4점 이상 준 영화를 기반으로 취향 분석
- Claude API를 활용한 맞춤 영화 5편 추천
- 추천 결과를 제목 / 개봉연도 / 장르 / 추천 이유 카드 형태로 표시

---

## 프로젝트 구조
 
```
my_movie_timeline/
├── frontend/               # React + Vite
│   └── src/
│       ├── components/     # NavBar, MovieCard 등 재사용 컴포넌트
│       ├── pages/          # Timeline, Login, Register, Recommend
│       ├── store/          # AppContext (전역 상태 관리)
│       ├── lib/            # api.js
|       ├── App.jsx         # 홈 화면 (영화 목록)
│       └── Router.jsx
│
└── backend/                # Spring Boot
    └── src/main/java/com/mymovie/backend/
        ├── movie/          # Movie 엔티티, CRUD API
        ├── user/           # User 엔티티, 회원가입/로그인 API
        ├── recommend/      # RecommendController, RecommendService
        ├── jwt/            # JwtUtil
        ├── security/       # SecurityConfig, JwtFilter
        └── ApiResponse.java  # 공통 응답 형식
```
 
---
 
## 백엔드 API
 
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/login` | 로그인 (JWT 발급) |
| GET | `/api/movies` | 영화 목록 조회 (페이지네이션, 정렬) |
| POST | `/api/movies` | 영화 등록 |
| PUT | `/api/movies/{id}` | 영화 수정 |
| DELETE | `/api/movies/{id}` | 영화 삭제 |
| GET | `/api/recommend` | AI 영화 추천 (userId 기반) |
 
---
