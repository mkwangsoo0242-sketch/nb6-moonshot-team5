import { Router, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { projectService } from '../services/project.service';
import { taskService } from '../services/task.service';
import { invitationService } from '../services/invitation.service';
import { authenticate, AuthRequest } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

const router = Router();

// POST /projects - 프로젝트 생성
router.post(
  '/',
  authenticate,
  [
    body('name').notEmpty().withMessage('프로젝트 이름을 입력해주세요'),
    validate
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const project = await projectService.create(req.userId!, req.body);
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  }
);

// GET /projects/:projectId - 프로젝트 조회
router.get(
  '/:projectId',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await projectService.getById(projectId, req.userId!);
      res.json(project);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /projects/:projectId - 프로젝트 수정
router.patch(
  '/:projectId',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await projectService.update(projectId, req.userId!, req.body);
      res.json(project);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /projects/:projectId - 프로젝트 삭제
router.delete(
  '/:projectId',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const result = await projectService.delete(projectId, req.userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /projects/:projectId/users - 프로젝트 멤버 조회
router.get(
  '/:projectId/users',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const result = await projectService.getMembers(projectId, req.userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /projects/:projectId/users/:userId - 프로젝트에서 유저 제외하기
router.delete(
  '/:projectId/users/:userId',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const targetUserId = parseInt(req.params.userId);
      const result = await projectService.removeMember(projectId, targetUserId, req.userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// POST /projects/:projectId/invitations - 프로젝트에 멤버 초대
router.post(
  '/:projectId/invitations',
  authenticate,
  [
    body('email').isEmail().withMessage('유효한 이메일을 입력해주세요'),
    validate
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const invitation = await invitationService.create(projectId, req.userId!, req.body.email);
      res.status(201).json(invitation);
    } catch (error) {
      next(error);
    }
  }
);

// POST /projects/:projectId/tasks - 프로젝트에 할 일 생성
router.post(
  '/:projectId/tasks',
  authenticate,
  [
    body('title').notEmpty().withMessage('제목을 입력해주세요'),
    validate
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const task = await taskService.create(projectId, req.userId!, req.body);
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }
);

// GET /projects/:projectId/tasks - 프로젝트의 할 일 목록 조회
router.get(
  '/:projectId/tasks',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { status, assigneeId, sort, keyword, page, limit } = req.query;
      const result = await taskService.getByProjectId(projectId, req.userId!, {
        status: status as string,
        assigneeId: assigneeId ? parseInt(assigneeId as string) : undefined,
        sort: sort as string,
        keyword: keyword as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
