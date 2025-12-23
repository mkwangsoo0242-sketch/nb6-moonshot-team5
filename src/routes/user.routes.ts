import { Router, Response, NextFunction } from 'express';
import { body, query } from 'express-validator';
import { userService } from '../services/user.service';
import { authenticate, AuthRequest } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

const router = Router();

// GET /users/me - 내 정보 조회
router.get(
  '/me',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await userService.getMe(req.userId!);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /users/me - 내 정보 수정
router.patch(
  '/me',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('현재 비밀번호를 입력해주세요'),
    validate
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, password, profileImage } = req.body;
      const user = await userService.updateMe(req.userId!, currentPassword, {
        password,
        profileImage
      });
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

// GET /users/me/projects - 참여 중인 프로젝트 조회
router.get(
  '/me/projects',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const sort = req.query.sort as string | undefined;
      const projects = await userService.getMyProjects(req.userId!, sort);
      res.json(projects);
    } catch (error) {
      next(error);
    }
  }
);

// GET /users/me/tasks - 참여 중인 모든 프로젝트의 할 일 목록 조회
router.get(
  '/me/tasks',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { projectId, status, assigneeId, sort, keyword, page, limit } = req.query;
      const result = await userService.getMyTasks(req.userId!, {
        projectId: projectId ? parseInt(projectId as string) : undefined,
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
