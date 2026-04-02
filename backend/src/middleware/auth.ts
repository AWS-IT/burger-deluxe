import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

interface AuthRequest extends Request {
  user?: { id: number; role: string; isActive: boolean };
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Доступ запрещен. Токен не предоставлен.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: number };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Токен недействителен.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Учетная запись заблокирована.'
      });
    }

    req.user = { id: user.id, role: user.role, isActive: user.isActive };
    next();
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    return res.status(401).json({
      success: false,
      message: 'Токен недействителен.'
    });
  }
};

export const adminAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Доступ запрещен. Токен не предоставлен.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: number };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Токен недействителен.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Учетная запись заблокирована.'
      });
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Доступ запрещен. Требуются права администратора.'
      });
    }

    req.user = { id: user.id, role: user.role, isActive: user.isActive };
    next();
  } catch (error) {
    console.error('Ошибка проверки прав администратора:', error);
    return res.status(401).json({
      success: false,
      message: 'Токен недействителен.'
    });
  }
};

export default auth;