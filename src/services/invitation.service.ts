import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import { NotFoundError, ForbiddenError, BadRequestError, ConflictError } from '../utils/errors';
import { emailService } from './email.service';

export class InvitationService {
  async create(projectId: number, userId: number, invitedEmail: string) {
    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } }
    });

    if (!membership || membership.role !== 'ADMIN') {
      throw new ForbiddenError('초대 권한이 없습니다');
    }

    // 이미 멤버인지 확인
    const invitedUser = await prisma.user.findUnique({
      where: { email: invitedEmail }
    });

    if (invitedUser) {
      const existingMember = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: invitedUser.id, projectId } }
      });

      if (existingMember) {
        throw new ConflictError('이미 프로젝트 멤버입니다');
      }
    }

    // 이미 초대 중인지 확인
    const existingInvitation = await prisma.invitation.findFirst({
      where: { projectId, invitedEmail, status: 'PENDING' }
    });

    if (existingInvitation) {
      throw new ConflictError('이미 초대가 진행 중입니다');
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.invitation.create({
      data: {
        projectId,
        invitedEmail,
        token,
        expiresAt
      },
      include: {
        project: { select: { name: true } }
      }
    });

    const inviteLink = `${process.env.FRONTEND_URL}/invitations/${token}/accept`;
    emailService.sendInvitationEmail(invitedEmail, invitation.project.name, inviteLink)
      .catch(console.error);

    return invitation;
  }

  async accept(invitationId: string, userId: number) {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId }
    });

    if (!invitation) {
      throw new NotFoundError('초대를 찾을 수 없습니다');
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestError('이미 처리된 초대입니다');
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestError('만료된 초대입니다');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.email !== invitation.invitedEmail) {
      throw new ForbiddenError('초대받은 이메일로 로그인해주세요');
    }

    // 트랜잭션: 초대 수락 + 멤버 추가
    await prisma.$transaction(async (tx) => {
      await tx.invitation.update({
        where: { id: invitationId },
        data: { status: 'ACCEPTED' }
      });

      await tx.projectMember.create({
        data: {
          userId,
          projectId: invitation.projectId,
          role: 'MEMBER'
        }
      });
    });

    return { message: '초대를 수락했습니다' };
  }

  async acceptByToken(token: string, userId: number) {
    const invitation = await prisma.invitation.findUnique({
      where: { token }
    });

    if (!invitation) {
      throw new NotFoundError('초대를 찾을 수 없습니다');
    }

    return this.accept(invitation.id, userId);
  }

  async cancel(invitationId: string, userId: number) {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId }
    });

    if (!invitation) {
      throw new NotFoundError('초대를 찾을 수 없습니다');
    }

    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: invitation.projectId } }
    });

    if (!membership || membership.role !== 'ADMIN') {
      throw new ForbiddenError('초대 취소 권한이 없습니다');
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestError('이미 처리된 초대입니다');
    }

    await prisma.invitation.delete({
      where: { id: invitationId }
    });

    return { message: '초대가 취소되었습니다' };
  }
}

export const invitationService = new InvitationService();
