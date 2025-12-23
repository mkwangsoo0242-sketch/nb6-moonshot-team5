import path from 'path';
import fs from 'fs';
import prisma from '../lib/prisma';
import { NotFoundError, ForbiddenError } from '../utils/errors';

interface UploadedFile {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
}

export class FileService {
  async upload(file: UploadedFile, taskId?: number, userId?: number) {
    if (taskId && userId) {
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

      const attachment = await prisma.attachment.create({
        data: {
          url: `/uploads/${file.filename}`,
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          taskId
        }
      });

      return attachment;
    }

    // 프로필 이미지 등 일반 파일 업로드
    return {
      url: `/uploads/${file.filename}`,
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    };
  }

  async deleteAttachment(attachmentId: number, userId: number) {
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { task: { select: { projectId: true } } }
    });

    if (!attachment) {
      throw new NotFoundError('첨부파일을 찾을 수 없습니다');
    }

    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: attachment.task.projectId } }
    });

    if (!membership) {
      throw new ForbiddenError('프로젝트에 접근 권한이 없습니다');
    }

    // 파일 시스템에서 삭제
    const filePath = path.join(process.cwd(), attachment.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.attachment.delete({ where: { id: attachmentId } });

    return { message: '첨부파일이 삭제되었습니다' };
  }
}

export const fileService = new FileService();
