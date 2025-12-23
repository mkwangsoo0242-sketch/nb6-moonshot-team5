import { Router, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { commentService } from '../services/comment.service';
import { authenticate, AuthRequest } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

const router = Router();

// GET /comments/:commentId - 댓글 조회
router.get(
  '/:commentId',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const commentId = parseInt(req.params.commentId);
      const comment = await commentService.getById(commentId, req.userId!);
      res.json(comment);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /comments/:commentId - 댓글 수정
router.patch(
  '/:commentId',
  authenticate,
  [
    body('content').notEmpty().withMessage('내용을 입력해주세요'),
    validate
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const commentId = parseInt(req.params.commentId);
      const comment = await commentService.update(commentId, req.userId!, req.body);
      res.json(comment);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /comments/:commentId - 댓글 삭제
router.delete(
  '/:commentId',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const commentId = parseInt(req.params.commentId);
      const result = await commentService.delete(commentId, req.userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
