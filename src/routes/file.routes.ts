import { Router, Response, NextFunction } from 'express';
import { fileService } from '../services/file.service';
import { authenticate, AuthRequest } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

// POST /files - 파일 업로드
router.post(
  '/',
  authenticate,
  upload.single('file'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: '파일이 필요합니다' });
      }

      const taskId = req.body.taskId ? parseInt(req.body.taskId) : undefined;
      
      const result = await fileService.upload(
        {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path
        },
        taskId,
        req.userId
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
