

import { Router, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { subtaskService } from '../service/subtask-service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// GET /subtasks/:subtaskId - 하위 할 일 조회
router.get(
  '/:subtaskId',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const subtaskId = parseInt(req.params.subtaskId);
      const subtask = await subtaskService.getById(subtaskId, req.userId!);
      res.json(subtask);
    } catch (error) {
      next(error);
    }
  }
);



// PATCH /subtasks/:subtaskId - 하위 할 일 수정
router.patch(
  '/:subtaskId',
  authenticate,
  [
    body('title').optional().notEmpty().withMessage('제목을 입력해주세요'),
    body('status').optional().isIn(['TODO', 'DONE']).withMessage('상태는 TODO 또는 DONE이어야 합니다'),
    validate
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const subtaskId = parseInt(req.params.subtaskId);
      const subtask = await subtaskService.update(subtaskId, req.userId!, req.body);
      res.json(subtask);
    } catch (error) {
      next(error);
    }
  }
);



// DELETE /subtasks/:subtaskId - 하위 할 일 삭제
router.delete(
  '/:subtaskId',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const subtaskId = parseInt(req.params.subtaskId);
      const result = await subtaskService.delete(subtaskId, req.userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
