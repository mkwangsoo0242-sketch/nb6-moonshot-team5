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
