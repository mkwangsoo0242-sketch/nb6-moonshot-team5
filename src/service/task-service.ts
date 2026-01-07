import prisma from '../lib/prisma';
import NotFoundError from '../lib/errors/NotFoundError';
import ForbiddenError from '../lib/errors/ForbiddenError';

interface CreateTaskInput {
  title: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  startYear?: number;
  startMonth?: number;
  startDay?: number;
  endYear?: number;
  endMonth?: number;
  endDay?: number;
  tags?: string[];
}

interface UpdateTaskInput extends Partial<CreateTaskInput> {
  assigneeId?: number | null;
}

export class TaskService {
  private async checkProjectMember(projectId: number, userId: number) {
    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } }
    });

    if (!membership) {
      throw new ForbiddenError('프로젝트에 접근 권한이 없습니다');
    }

    return membership;
  }

  async create(projectId: number, userId: number, input: CreateTaskInput) {
    await this.checkProjectMember(projectId, userId);

    const { tags, ...taskData } = input;

    const task = await prisma.$transaction(async (tx) => {
      const newTask = await tx.task.create({
        data: {
          ...taskData,
          projectId,
          assigneeId: userId
        }
      });

      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          const tag = await tx.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName }
          });

          await tx.taskTag.create({
            data: { taskId: newTask.id, tagId: tag.id }
          });
        }
      }

      return newTask;
    });

    return this.getById(task.id, userId);
  }

  async getByProjectId(
    projectId: number,
    userId: number,
    options: {
      status?: string;
      assigneeId?: number;
      sort?: string;
      keyword?: string;
      page?: number;
      limit?: number;
    }
  ) {
    await this.checkProjectMember(projectId, userId);

    const { status, assigneeId, sort, keyword, page = 1, limit = 10 } = options;

    const where: any = { projectId };

    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;
    if (keyword) {
      where.title = { contains: keyword, mode: 'insensitive' };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'name') orderBy = { title: 'asc' };
    if (sort === 'dueDate') orderBy = [{ endYear: 'asc' }, { endMonth: 'asc' }, { endDay: 'asc' }];

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignee: { select: { id: true, name: true, profileImage: true } },
          tags: { include: { tag: true } },
          _count: { select: { subtasks: true, comments: true } }
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.task.count({ where })
    ]);

    return {
      tasks: tasks.map(t => ({
        ...t,
        tags: t.tags.map(tt => tt.tag.name)
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  async getById(taskId: number, userId: number) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, profileImage: true } },
        tags: { include: { tag: true } },
        subtasks: { orderBy: { createdAt: 'asc' } },
        attachments: true
      }
    });

    if (!task) {
      throw new NotFoundError('할 일을 찾을 수 없습니다');
    }

    await this.checkProjectMember(task.projectId, userId);

    return {
      ...task,
      tags: task.tags.map(tt => tt.tag.name)
    };
  }

  async update(taskId: number, userId: number, input: UpdateTaskInput) {
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      throw new NotFoundError('할 일을 찾을 수 없습니다');
    }

    await this.checkProjectMember(task.projectId, userId);

    const { tags, ...taskData } = input;

    // 담당자 변경 시 프로젝트 멤버인지 확인
    if (taskData.assigneeId) {
      const assigneeMembership = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: taskData.assigneeId, projectId: task.projectId } }
      });

      if (!assigneeMembership) {
        throw new ForbiddenError('담당자는 프로젝트 멤버여야 합니다');
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.task.update({
        where: { id: taskId },
        data: taskData
      });

      if (tags !== undefined) {
        await tx.taskTag.deleteMany({ where: { taskId } });

        for (const tagName of tags) {
          const tag = await tx.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName }
          });

          await tx.taskTag.create({
            data: { taskId, tagId: tag.id }
          });
        }
      }
    });

    return this.getById(taskId, userId);
  }

  async delete(taskId: number, userId: number) {
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      throw new NotFoundError('할 일을 찾을 수 없습니다');
    }

    await this.checkProjectMember(task.projectId, userId);

    await prisma.task.delete({ where: { id: taskId } });

    return { message: '할 일이 삭제되었습니다' };
  }
}

export const taskService = new TaskService();
