import { Router, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { taskService } from '../service/task-service';
import { subtaskService } from '../service/subtask-service';
// import { commentService } from '../service/comment-service'; // Service missing
import { authenticate, AuthRequest } from '../middleware/  ';
import { validate } from '../middleware/    ';

const router = Router();


// POST /tasks/:taskId/subtasks - 하위 할 일 생성
router.post(
  '/:taskId/subtasks',
  authenticate,
  [
    body('title').notEmpty().withMessage('제목을 입력해주세요'),
    validate
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const subtask = await subtaskService.create(taskId, req.userId!, req.body);
      res.status(201).json(subtask);
    } catch (error) {
      next(error);
    }
  }
);

// GET /tasks/:taskId/subtasks - 하위 할 일 목록 조회
router.get(
  '/:taskId/subtasks',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const subtasks = await subtaskService.getByTaskId(taskId, req.userId!);
      res.json(subtasks);
    } catch (error) {
      next(error);
    }
  }
);



export default router;
