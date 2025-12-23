import { Router, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { authService } from '../services/auth.service';
import { validate } from '../middlewares/validate';

const router = Router();

// POST /auth/register - 회원가입
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('유효한 이메일을 입력해주세요'),
    body('name').notEmpty().withMessage('이름을 입력해주세요'),
    body('password').isLength({ min: 6 }).withMessage('비밀번호는 6자 이상이어야 합니다'),
    validate
  ],
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// POST /auth/login - 로그인
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('유효한 이메일을 입력해주세요'),
    body('password').notEmpty().withMessage('비밀번호를 입력해주세요'),
    validate
  ],
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// POST /auth/refresh - 토큰 갱신
router.post(
  '/refresh',
  [
    body('refreshToken').notEmpty().withMessage('리프레시 토큰이 필요합니다'),
    validate
  ],
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const result = await authService.refresh(req.body.refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
