import { Router, Response, NextFunction } from 'express';
import { invitationService } from '../services/invitation.service';
import { authenticate, AuthRequest } from '../middlewares/auth';

const router = Router();

// POST /invitations/:invitationId/accept - 멤버 초대 수락
router.post(
  '/:invitationId/accept',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { invitationId } = req.params;
      
      // UUID 형식이면 token으로 처리, 아니면 id로 처리
      const isUuid = invitationId.includes('-');
      
      let result;
      if (isUuid && invitationId.length > 30) {
        // token으로 수락
        result = await invitationService.acceptByToken(invitationId, req.userId!);
      } else {
        result = await invitationService.accept(invitationId, req.userId!);
      }
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /invitations/:invitationId - 멤버 초대 삭제
router.delete(
  '/:invitationId',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { invitationId } = req.params;
      const result = await invitationService.cancel(invitationId, req.userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
