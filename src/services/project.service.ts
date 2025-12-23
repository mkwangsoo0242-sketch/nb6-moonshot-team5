import prisma from '../lib/prisma';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { emailService } from './email.service';

interface CreateProjectInput {
  name: string;
  description?: string;
}

interface UpdateProjectInput {
  name?: string;
  description?: string;
}

export class ProjectService {
  async create(userId: number, input: CreateProjectInput) {
    const projectCount = await prisma.projectMember.count({
      where: { userId, role: 'ADMIN' }
    });

    if (projectCount >= 5) {
      throw new BadRequestError('프로젝트는 최대 5개까지 생성 가능합니다');
    }

    const project = await prisma.$transaction(async (tx) => {
      const newProject = await tx.project.create({
        data: {
          name: input.name,
          description: input.description
        }
      });

      await tx.projectMember.create({
        data: {
          userId,
          projectId: newProject.id,
          role: 'ADMIN'
        }
      });

      return newProject;
    });

    return project;
  }

  async getById(projectId: number, userId: number) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { role: 'ADMIN' },
          include: { user: { select: { id: true, name: true, profileImage: true } } }
        },
        _count: { select: { members: true, tasks: true } }
      }
    });

    if (!project) {
      throw new NotFoundError('프로젝트를 찾을 수 없습니다');
    }

    const isMember = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } }
    });

    if (!isMember) {
      throw new ForbiddenError('프로젝트에 접근 권한이 없습니다');
    }

    return {
      ...project,
      creator: project.members[0]?.user
    };
  }

  async update(projectId: number, userId: number, input: UpdateProjectInput) {
    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } }
    });

    if (!membership) {
      throw new NotFoundError('프로젝트를 찾을 수 없습니다');
    }

    if (membership.role !== 'ADMIN') {
      throw new ForbiddenError('프로젝트 수정 권한이 없습니다');
    }

    return prisma.project.update({
      where: { id: projectId },
      data: input
    });
  }

  async delete(projectId: number, userId: number) {
    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } }
    });

    if (!membership) {
      throw new NotFoundError('프로젝트를 찾을 수 없습니다');
    }

    if (membership.role !== 'ADMIN') {
      throw new ForbiddenError('프로젝트 삭제 권한이 없습니다');
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: { user: { select: { email: true } } }
        }
      }
    });

    if (!project) {
      throw new NotFoundError('프로젝트를 찾을 수 없습니다');
    }

    const memberEmails = project.members
      .filter(m => m.userId !== userId)
      .map(m => m.user.email);

    await prisma.project.delete({ where: { id: projectId } });

    if (memberEmails.length > 0) {
      emailService.sendProjectDeletedNotification(memberEmails, project.name)
        .catch(console.error);
    }

    return { message: '프로젝트가 삭제되었습니다' };
  }

  async getMembers(projectId: number, userId: number) {
    const isMember = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } }
    });

    if (!isMember) {
      throw new ForbiddenError('프로젝트에 접근 권한이 없습니다');
    }

    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: { select: { id: true, email: true, name: true, profileImage: true } }
      }
    });

    const pendingInvitations = await prisma.invitation.findMany({
      where: { projectId, status: 'PENDING' },
      select: { id: true, invitedEmail: true, createdAt: true }
    });

    return {
      members: members.map(m => ({
        id: m.user.id,
        email: m.user.email,
        name: m.user.name,
        profileImage: m.user.profileImage,
        role: m.role,
        joinedAt: m.createdAt
      })),
      pendingInvitations
    };
  }

  async removeMember(projectId: number, targetUserId: number, userId: number) {
    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } }
    });

    if (!membership || membership.role !== 'ADMIN') {
      throw new ForbiddenError('멤버 제외 권한이 없습니다');
    }

    const targetMembership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: targetUserId, projectId } }
    });

    if (!targetMembership) {
      throw new NotFoundError('멤버를 찾을 수 없습니다');
    }

    if (targetMembership.role === 'ADMIN') {
      throw new BadRequestError('프로젝트 관리자는 제외할 수 없습니다');
    }

    await prisma.projectMember.delete({
      where: { userId_projectId: { userId: targetUserId, projectId } }
    });

    return { message: '멤버가 제외되었습니다' };
  }
}

export const projectService = new ProjectService();
