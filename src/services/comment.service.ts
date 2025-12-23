import prisma from '../lib/prisma';
import { NotFoundError, ForbiddenError } from '../utils/errors';

interface CreateCommentInput {
  content: string;
}

export class CommentService {
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

  async create(taskId: number, userId: number, input: CreateCommentInput) {
    await this.checkTaskAccess(taskId, userId);

    const comment = await prisma.comment.create({
      data: {
        content: input.content,
        taskId,
        authorId: userId
      },
      include: {
        author: { select: { id: true, name: true, profileImage: true } }
      }
    });

    return comment;
  }

  async getByTaskId(taskId: number, userId: number) {
    await this.checkTaskAccess(taskId, userId);

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        author: { select: { id: true, name: true, profileImage: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return comments;
  }

  async getById(commentId: number, userId: number) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        author: { select: { id: true, name: true, profileImage: true } },
        task: { select: { projectId: true } }
      }
    });

    if (!comment) {
      throw new NotFoundError('댓글을 찾을 수 없습니다');
    }

    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: comment.task.projectId } }
    });

    if (!membership) {
      throw new ForbiddenError('프로젝트에 접근 권한이 없습니다');
    }

    return comment;
  }

  async update(commentId: number, userId: number, input: CreateCommentInput) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      throw new NotFoundError('댓글을 찾을 수 없습니다');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenError('본인이 작성한 댓글만 수정할 수 있습니다');
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { content: input.content },
      include: {
        author: { select: { id: true, name: true, profileImage: true } }
      }
    });

    return updated;
  }

  async delete(commentId: number, userId: number) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      throw new NotFoundError('댓글을 찾을 수 없습니다');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenError('본인이 작성한 댓글만 삭제할 수 있습니다');
    }

    await prisma.comment.delete({ where: { id: commentId } });

    return { message: '댓글이 삭제되었습니다' };
  }
}

export const commentService = new CommentService();
