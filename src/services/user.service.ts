import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { NotFoundError, UnauthorizedError } from '../utils/errors';

interface UpdateUserInput {
  password?: string;
  profileImage?: string;
}

export class UserService {
  async getMe(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new NotFoundError('사용자를 찾을 수 없습니다');
    }

    return user;
  }

  async updateMe(userId: number, currentPassword: string, input: UpdateUserInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('사용자를 찾을 수 없습니다');
    }

    if (user.password) {
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        throw new UnauthorizedError('비밀번호가 올바르지 않습니다');
      }
    }

    const updateData: any = {};

    if (input.password) {
      updateData.password = await bcrypt.hash(input.password, 10);
    }

    if (input.profileImage !== undefined) {
      updateData.profileImage = input.profileImage;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        createdAt: true
      }
    });

    return updatedUser;
  }

  async getMyProjects(userId: number, sort?: string) {
    const orderBy: any = sort === 'name' 
      ? { project: { name: 'asc' } } 
      : { project: { createdAt: 'desc' } };

    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            _count: { select: { members: true } },
            tasks: { select: { status: true } },
            members: {
              where: { role: 'ADMIN' },
              select: { userId: true }
            }
          }
        }
      },
      orderBy
    });

    return memberships.map(m => {
      const taskCounts = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
      m.project.tasks.forEach(task => {
        taskCounts[task.status]++;
      });

      return {
        id: m.project.id,
        name: m.project.name,
        description: m.project.description,
        creatorId: m.project.members[0]?.userId,
        memberCount: m.project._count.members,
        taskCounts,
        createdAt: m.project.createdAt,
        updatedAt: m.project.updatedAt
      };
    });
  }

  async getMyTasks(
    userId: number,
    options: {
      projectId?: number;
      status?: string;
      assigneeId?: number;
      sort?: string;
      keyword?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const { projectId, status, assigneeId, sort, keyword, page = 1, limit = 10 } = options;

    const where: any = {
      project: {
        members: { some: { userId } }
      }
    };

    if (projectId) where.projectId = projectId;
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
          project: { select: { id: true, name: true } },
          tags: { include: { tag: true } }
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
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

export const userService = new UserService();
