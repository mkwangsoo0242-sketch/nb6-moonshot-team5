<<<<<<< HEAD
# Moonshot API

프로젝트 일정 관리 서비스 백엔드 API

## 기술 스택

- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL
- JWT 인증

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일에서 DATABASE_URL 등 설정

# Prisma 클라이언트 생성
npm run prisma:generate

# 데이터베이스 마이그레이션
npm run prisma:migrate

# 개발 서버 실행
npm run dev
```

## API 엔드포인트

### 인증
- `POST /auth/register` - 회원가입
- `POST /auth/login` - 로그인
- `POST /auth/refresh` - 토큰 갱신

### 유저
- `GET /users/me` - 내 정보 조회
- `PATCH /users/me` - 내 정보 수정
- `GET /users/me/projects` - 참여 중인 프로젝트 조회
- `GET /users/me/tasks` - 참여 중인 모든 프로젝트의 할 일 목록 조회

### 프로젝트
- `POST /projects` - 프로젝트 생성
- `GET /projects/:projectId` - 프로젝트 조회
- `PATCH /projects/:projectId` - 프로젝트 수정
- `DELETE /projects/:projectId` - 프로젝트 삭제
- `GET /projects/:projectId/users` - 프로젝트 멤버 조회
- `DELETE /projects/:projectId/users/:userId` - 프로젝트에서 유저 제외
- `POST /projects/:projectId/invitations` - 프로젝트에 멤버 초대
- `POST /projects/:projectId/tasks` - 프로젝트에 할 일 생성
- `GET /projects/:projectId/tasks` - 프로젝트의 할 일 목록 조회

### 할 일
- `GET /tasks/:taskId` - 할 일 조회
- `PATCH /tasks/:taskId` - 할 일 수정
- `DELETE /tasks/:taskId` - 할 일 삭제
- `POST /tasks/:taskId/subtasks` - 하위 할 일 생성
- `GET /tasks/:taskId/subtasks` - 하위 할 일 목록 조회
- `POST /tasks/:taskId/comments` - 할 일에 댓글 추가
- `GET /tasks/:taskId/comments` - 할 일에 달린 댓글 조회

### 하위 할 일
- `GET /subtasks/:subtaskId` - 하위 할 일 조회
- `PATCH /subtasks/:subtaskId` - 하위 할 일 수정
- `DELETE /subtasks/:subtaskId` - 하위 할 일 삭제

### 댓글
- `GET /comments/:commentId` - 댓글 조회
- `PATCH /comments/:commentId` - 댓글 수정
- `DELETE /comments/:commentId` - 댓글 삭제

### 초대
- `POST /invitations/:invitationId/accept` - 멤버 초대 수락
- `DELETE /invitations/:invitationId` - 멤버 초대 삭제

### 파일
- `POST /files` - 파일 업로드
=======
# nb6-moonshot-team5

# 🎓 팀 5

> 코드잇 노드 백엔드 6기
> 백엔드 중급 프로젝트 : MoonShot

📎 **팀 협업 문서:** [링크 게시 예정]

---

## 👥 팀원 구성

| 이름   | 역할                                 | Github                            |
| ------ | ------------------------------------ | --------------------------------- |
| 김지수 | 소셜 로그인 / 회원 추가 정보 API     | [웨인 Github](개인 Github 링크)   |
| 나영준 | 권한 관리 / 반응형 레이아웃 API      | [제이든 Github](개인 Github 링크) |
| 박건용 | 수강생 정보 관리 / 공용 Button API   | [마크 Github](개인 Github 링크)   |
| 이광수 | 관리자 API / 회원관리 슬라이더       | [데이지 Github](개인 Github 링크) |
| 이상휘 | 학생 시간 정보 관리 / 공용 Modal API | [제이 Github](개인 Github 링크)   |

---

## 🧩 프로젝트 소개

**목표:**  
일정 관리 사이트의 **백엔드 시스템 구축**을 통해 인증, 회원, 프로젝트, 할 일등 핵심 기능을 구현합니다.

**주요 기능:**

- 소셜 로그인 (Google OAuth)
- 토큰 기반 인증
- 프로젝트 등록 및 수정, 삭제
- 할 일, 하위 할 일
- 멤버 초대 및 추가, 제외
- 대시보드

---

## 🛠️ 기술 스택

| 구분          | 기술                          |
| ------------- | ----------------------------- |
| **Backend**   | Express.js, Prisma ORM        |
| **Database**  | Postgresql                    |
| **공통 Tool** | Git & Github, Discord, Notion |

---

## 🧑‍💻 팀원별 구현 기능

### 웨인

> ![웨인 작업 이미지](첨부 이미지 또는 gif 파일 경로)

- **소셜 로그인 API**
  - Google OAuth 2.0 기반 로그인 기능 구현
  - 로그인 후 추가 정보 입력을 위한 API 엔드포인트 개발
- **회원 추가 정보 입력 API**
  - 회원 유형(관리자 / 학생)에 따른 조건부 입력 처리 API 구현

---

### 제이든

> ![제이든 작업 이미지](첨부 이미지 또는 gif 파일 경로)

- **회원별 권한 관리**
  - 사용자 역할(Role)에 따라 접근 권한 설정 API 구현
  - 관리자/일반 사용자 페이지용 조건부 라우팅 기능 추가
- **반응형 레이아웃 API**
  - 클라이언트 요청에 맞춰 레이아웃 데이터 제공 API 개발

---

### 마크

> ![마크 작업 이미지](첨부 이미지 또는 gif 파일 경로)

- **수강생 정보 관리 API**
  - `fetch(GET)`으로 수강생 정보 조회 API 구현
  - 반응형 UI 데이터 구성
- **공용 Button API**
  - 공통 버튼 액션을 처리하는 API 개발

---

### 데이지

> ![데이지 작업 이미지](첨부 이미지 또는 gif 파일 경로)

- **관리자 API**
  - Path Parameter를 이용한 동적 라우팅 구현
  - `fetch(PATCH, DELETE)`를 통한 학생 정보 수정 및 탈퇴 처리
- **CRUD 기능**
  - 학생 정보 생성·조회·수정·삭제 API 구축
- **회원관리 슬라이더**
  - carousel 방식으로 학생 목록 제공 API 구현

---

### 제이

> ![제이 작업 이미지](첨부 이미지 또는 gif 파일 경로)

- **학생 시간 정보 관리 API**
  - 학생별 시간 정보 조회 API 구현
  - `fetch(GET)`으로 실시간 접속 현황 관리
- **수정 및 탈퇴 API**
  - `fetch(PATCH, DELETE)`로 개인정보 수정 및 탈퇴 처리
- **공용 Modal API**
  - 공통 Modal 기능 처리 API 개발

---

## 📁 프로젝트 구조

```bash
NB6-MoonShot-TEAM5
├── prisma
│   ├── migrations
│   ├── schema.prisma
│   └── seed.js
├── src
│   ├── constrollers
│   │   ├── badge-controller.js
│   │   ├── group-controller.js
│   │   ├── group-like-count-controller.js
│   │   ├── health-controller.js
│   │   ├── image-controller.js
│   │   ├── participant-controller.js
│   │   ├── ranking-controller.js
│   │   └── record-controller.js
│   ├── middlewares
│   │   ├── error-handler.js
│   │   └── upload.js
│   ├── routes
│   │   ├── group-like-count-routes.js
│   │   ├── group-routes.js
│   │   ├── health-routes.js
│   │   ├── image-routes.js
│   │   ├── participant-routes.js
│   │   ├── ranking-routes.js
│   │   └── record-routes.js
│   ├── utils
│   │   ├── date-range.js
│   │   ├── debug.js
│   │   ├── discord-msg-utils.js
│   │   ├── image-utils.js
│   │   └── prisma.js
│   ├── validators
│   │   └── record-validatior.js
│   └── app.js
├── .env
├── .gitignore
├── .prettierrc
├── .prettierrc.json
├── package-lock.json
├── package.json
└── README.md
```

---

## 🌐 구현 홈페이지

[https://www.codeit.kr/](https://www.codeit.kr/)

---

## 🧠 프로젝트 회고록

> 발표자료 및 회고록 링크: (제작한 발표자료 링크 또는 첨부)

---

📌 **작성일:** 2025-11-03  
📌 **작성자:** nb6기 Team5
>>>>>>> 49323415b194274ed9189d0bcec2c4c37be0c1a9
