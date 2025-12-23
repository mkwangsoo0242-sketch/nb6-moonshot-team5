import { Router, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { taskService } from '../services/task.service';
import { subtaskService } from '../services/subtask.service';
import { commentService } from '../services/comment.service';
import { authenticate, AuthRequest } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

const router = Router();

// GET /tasks/:taskId - 할 일 조회
router.get(
  '/:taskId',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const task = await taskService.getById(taskId, req.userId!);
      res.json(task);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /tasks/:taskId - 할 일 수정
router.patch(
  '/:taskId',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const task = await taskService.update(taskId, req.userId!, req.body);
      res.json(task);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /tasks/:taskId - 할 일 삭제
router.delete(
  '/:taskId',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const result = await taskService.delete(taskId, req.userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

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

// POST /tasks/:taskId/comments - 할 일에 댓글 추가
router.post(
  '/:taskId/comments',
  authenticate,
  [
    body('content').notEmpty().withMessage('내용을 입력해주세요'),
    validate
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const comment = await commentService.create(taskId, req.userId!, req.body);
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }
);

// GET /tasks/:taskId/comments - 할 일에 달린 댓글 조회
router.get(
  '/:taskId/comments',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const comments = await commentService.getByTaskId(taskId, req.userId!);
      res.json(comments);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
