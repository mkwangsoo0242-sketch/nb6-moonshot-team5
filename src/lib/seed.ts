import { PrismaClient, InvitationStatus, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  //유저 생성
  const user1 = await prisma.user.create({
    data: {
      name: '김코드',
      email: 'code@example.com',
      password: '1234',
    },
  });
  const user2 = await prisma.user.create({
    data: {
      name: '김봇',
      email: 'bot@example.com',
      password: '1234',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: '코드잇',
      email: 'codeit@example.com',
      password: '1234',
    },
  });

  const user4 = await prisma.user.create({
    data: {
      name: '노션왕',
      email: 'notionking@example.com',
      password: '1234',
    },
  });

  const user5 = await prisma.user.create({
    data: {
      name: '정리왕',
      email: 'king@example.com',
      password: '1234',
    },
  });

  //프로젝트 생성
  const project = await prisma.project.create({
    data: {
      name: 'Moonshot Project',
      description: '팀 프로젝트 관리 툴',
      ownerId: user1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: '초대형 프로젝트',
      description: '초대형 프로젝트 너무 큽니다. 주의하세요',
      ownerId: user3.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Dear CarMate',
      description: '중고차 거래 사이트',
      ownerId: user4.id,
    },
  });

  //멤버 생성(프로젝트 오너 포함)
  await prisma.projectMember.createMany({
    data: [
      { projectId: project.id, userId: user1.id },
      { projectId: project.id, userId: user2.id },
    ],
  });

  await prisma.projectMember.createMany({
    data: [
      { projectId: project2.id, userId: user3.id },
      { projectId: project2.id, userId: user2.id },
      { projectId: project2.id, userId: user1.id },
      { projectId: project2.id, userId: user4.id },
    ],
  });

  await prisma.projectMember.createMany({
    data: [
      { projectId: project3.id, userId: user4.id },
      { projectId: project3.id, userId: user5.id },
      { projectId: project3.id, userId: user1.id },
    ],
  });

  //할 일 생성
  const task = await prisma.task.create({
    data: {
      title: 'API 설계',
      projectId: project.id,
      startYear: 2025,
      startMonth: 12,
      startDay: 23,
      endYear: 2026,
      endMonth: 1,
      endDay: 17,
      status: TaskStatus.IN_PROGRESS,
      assigneeId: user2.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: '팀 미팅',
      projectId: project2.id,
      startYear: 2026,
      startMonth: 1,
      startDay: 1,
      endYear: 2026,
      endMonth: 1,
      endDay: 7,
      status: TaskStatus.TODO,
      assigneeId: user4.id,
    },
  });

  //서브 할 일 생성
  await prisma.subTask.create({
    data: {
      title: 'ERD 작성',
      taskId: task.id,
      status: TaskStatus.TODO,
    },
  });

  //태그 생성
  const tag = await prisma.tag.create({
    data: { name: 'Backend' },
  });

  await prisma.taskTag.create({
    data: {
      taskId: task.id,
      tagId: tag.id,
    },
  });

  //댓글 생성
  await prisma.comment.create({
    data: {
      content: '이 부분은 이렇게 수정하면 좋을 것 같아요',
      taskId: task.id,
      authorId: user1.id,
    },
  });

  await prisma.invitation.create({
    data: {
      projectId: project.id,
      invitedEmail: 'invite@test.com',
      status: InvitationStatus.PENDING,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
