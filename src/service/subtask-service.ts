import prisma from '../lib/prisma';
import NotFoundError from '../lib/errors/NotFoundError';
import ForbiddenError from '../lib/errors/ForbiddenError';

interface CreateSubtaskInput {
  title: string;
}

interface UpdateSubtaskInput {
  title?: string;
  status?: 'TODO' | 'DONE';
}

export class SubtaskService {
  private async checkTaskAccess(taskId: number, userId: number) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true }
    });

    if (!task) {
      throw new NotFoundError('할 일을 찾을 수 없습니다');
    }

    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: task.projectId } }
    });

    if (!membership) {
      throw new ForbiddenError('프로젝트에 접근 권한이 없습니다');
    }

    return task;
  }

  async create(taskId: number, userId: number, input: CreateSubtaskInput) {
    await this.checkTaskAccess(taskId, userId);

    const subtask = await prisma.subTask.create({
      data: {
        title: input.title,
        taskId
      }
    });

    return subtask;
  }

  async getByTaskId(taskId: number, userId: number) {
    await this.checkTaskAccess(taskId, userId);

    const subtasks = await prisma.subTask.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' }
    });

    return subtasks;
  }

  async getById(subtaskId: number, userId: number) {
    const subtask = await prisma.subTask.findUnique({
      where: { id: subtaskId },
      include: { task: { select: { projectId: true } } }
    });

    if (!subtask) {
      throw new NotFoundError('하위 할 일을 찾을 수 없습니다');
    }

    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: subtask.task.projectId } }
    });

    if (!membership) {
      throw new ForbiddenError('프로젝트에 접근 권한이 없습니다');
    }

    return subtask;
  }

  async update(subtaskId: number, userId: number, input: UpdateSubtaskInput) {
    const subtask = await prisma.subTask.findUnique({
      where: { id: subtaskId },
      include: { task: { select: { projectId: true } } }
    });

    if (!subtask) {
      throw new NotFoundError('하위 할 일을 찾을 수 없습니다');
    }

    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: subtask.task.projectId } }
    });

    if (!membership) {
      throw new ForbiddenError('프로젝트에 접근 권한이 없습니다');
    }

    const updated = await prisma.subTask.update({
      where: { id: subtaskId },
      data: input
    });

    return updated;
  }

  async delete(subtaskId: number, userId: number) {
    const subtask = await prisma.subTask.findUnique({
      where: { id: subtaskId },
      include: { task: { select: { projectId: true } } }
    });

    if (!subtask) {
      throw new NotFoundError('하위 할 일을 찾을 수 없습니다');
    }

    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: subtask.task.projectId } }
    });

    if (!membership) {
      throw new ForbiddenError('프로젝트에 접근 권한이 없습니다');
    }

    await prisma.subTask.delete({ where: { id: subtaskId } });

    return { message: '하위 할 일이 삭제되었습니다' };
  }
}

export const subtaskService = new SubtaskService();
