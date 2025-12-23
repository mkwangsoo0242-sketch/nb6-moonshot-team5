import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { UnauthorizedError, ConflictError } from '../utils/errors';

interface RegisterInput {
  email: string;
  name: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  private generateTokens(userId: number) {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
  }

  async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email }
    });

    if (existingUser) {
      throw new ConflictError('이미 사용 중인 이메일입니다');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        createdAt: true
      }
    });

    const tokens = this.generateTokens(user.id);

    return { user, ...tokens };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email }
    });

    if (!user || !user.password) {
      throw new UnauthorizedError('이메일 또는 비밀번호가 올바르지 않습니다');
    }

    const isValidPassword = await bcrypt.compare(input.password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('이메일 또는 비밀번호가 올바르지 않습니다');
    }

    const tokens = this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
        createdAt: user.createdAt
      },
      ...tokens
    };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'refresh-secret'
      ) as { userId: number };

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw new UnauthorizedError('유효하지 않은 토큰입니다');
      }

      const tokens = this.generateTokens(user.id);
      return tokens;
    } catch {
      throw new UnauthorizedError('유효하지 않은 토큰입니다');
    }
  }
}

export const authService = new AuthService();
