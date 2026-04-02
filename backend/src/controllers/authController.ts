import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../config/database';

// Схемы валидации
const registerSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(50, 'Имя слишком длинное'),
  email: z.string().email('Неверный формат email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Неверный формат телефона'),
  address: z.object({
    street: z.string().min(5, 'Адрес должен содержать минимум 5 символов'),
    apartment: z.string().optional(),
    floor: z.string().optional(),
    comment: z.string().optional()
  })
});

const loginSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(1, 'Пароль обязателен')
});

// Генерация JWT токена
const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
};

// Регистрация
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Пользователь с таким email уже существует'
      });
      return;
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Создаем пользователя с адресом
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        phone: validatedData.phone,
        addresses: {
          create: {
            street: validatedData.address.street,
            apartment: validatedData.address.apartment || null,
            floor: validatedData.address.floor || null,
            comment: validatedData.address.comment || null,
            isDefault: true
          }
        }
      },
      include: {
        addresses: true
      }
    });

    // Генерируем токен
    const token = generateToken(user.id);

    // Устанавливаем cookie с токеном
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
    });

    res.status(201).json({
      success: true,
      message: 'Регистрация успешна',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses
      },
      token
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);

    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Ошибка валидации данных',
        errors: error.errors.map(err => err.message)
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};

// Вход в систему
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Ищем пользователя
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: { addresses: true }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Неверный email или пароль'
      });
      return;
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Неверный email или пароль'
      });
      return;
    }

    // Проверяем активность аккаунта
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Учетная запись заблокирована'
      });
      return;
    }

    // Генерируем токен
    const token = generateToken(user.id);

    // Устанавливаем cookie с токеном
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
    });

    res.json({
      success: true,
      message: 'Вход выполнен успешно',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses
      },
      token
    });
  } catch (error) {
    console.error('Ошибка входа:', error);

    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Ошибка валидации данных',
        errors: error.errors.map(err => err.message)
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};

// Выход из системы
export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie('token');
    res.json({
      success: true,
      message: 'Выход выполнен успешно'
    });
  } catch (error) {
    console.error('Ошибка выхода:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};

// Получение текущего пользователя
export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { addresses: true }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};

// Обновление профиля
export const updateProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const { name, phone, avatar } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(avatar && { avatar })
      },
      include: { addresses: true }
    });

    res.json({
      success: true,
      message: 'Профиль обновлен успешно',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};