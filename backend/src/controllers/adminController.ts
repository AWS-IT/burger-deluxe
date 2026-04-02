import { Request, Response } from 'express';
import prisma from '../config/database';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Типы категорий
type CategoryEnum = 'SIGNATURE_BURGERS' | 'CLASSIC_BURGERS' | 'CHICKEN_SIDES' | 'FRIES_SNACKS' | 'DRINKS_SHAKES' | 'DESSERTS';

const categoryMap: Record<string, CategoryEnum> = {
  'signature-burgers': 'SIGNATURE_BURGERS',
  'classic-burgers': 'CLASSIC_BURGERS',
  'chicken-sides': 'CHICKEN_SIDES',
  'fries-snacks': 'FRIES_SNACKS',
  'drinks-shakes': 'DRINKS_SHAKES',
  'desserts': 'DESSERTS'
};

const reverseCategoryMap: Record<CategoryEnum, string> = {
  'SIGNATURE_BURGERS': 'signature-burgers',
  'CLASSIC_BURGERS': 'classic-burgers',
  'CHICKEN_SIDES': 'chicken-sides',
  'FRIES_SNACKS': 'fries-snacks',
  'DRINKS_SHAKES': 'drinks-shakes',
  'DESSERTS': 'desserts'
};

// Схема валидации для создания/обновления блюда
const dishSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(500),
  category: z.enum(['signature-burgers', 'classic-burgers', 'chicken-sides', 'fries-snacks', 'drinks-shakes', 'desserts']),
  price: z.union([z.string(), z.number()]).transform(val => Number(val)),
  weight: z.union([z.string(), z.number()]).transform(val => Number(val)),
  calories: z.union([z.string(), z.number()]).transform(val => Number(val)),
  ingredients: z.union([z.string(), z.array(z.string())]).transform(val =>
    typeof val === 'string' ? val : JSON.stringify(val)
  ).optional(),
  isSpicy: z.union([z.boolean(), z.string()]).transform(val => val === true || val === 'true').optional(),
  isVegetarian: z.union([z.boolean(), z.string()]).transform(val => val === true || val === 'true').optional(),
  isNew: z.union([z.boolean(), z.string()]).transform(val => val === true || val === 'true').optional(),
  isPopular: z.union([z.boolean(), z.string()]).transform(val => val === true || val === 'true').optional(),
  stock: z.union([z.string(), z.number()]).transform(val => Number(val)).optional(),
  isAvailable: z.union([z.boolean(), z.string()]).transform(val => val === true || val === 'true').optional()
});

// Преобразование блюда для API
const transformDish = (dish: any) => ({
  _id: dish.id.toString(),
  id: dish.id.toString(),
  name: dish.name,
  description: dish.description,
  category: reverseCategoryMap[dish.category as CategoryEnum] || dish.category,
  price: Number(dish.price),
  weight: dish.weight,
  calories: dish.calories,
  images: dish.images?.map((img: any) => img.path) || [],
  ingredients: JSON.parse(dish.ingredients || '[]'),
  isSpicy: dish.isSpicy,
  isVegetarian: dish.isVegetarian,
  isNewDish: dish.isNew,
  isPopular: dish.isPopular,
  externalId: dish.externalId,
  source: dish.source,
  stock: dish.stock,
  isAvailable: dish.isAvailable,
  createdAt: dish.createdAt,
  updatedAt: dish.updatedAt
});

// Получить все блюда (для админа)
export const getAllDishesAdmin = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;

    const where: any = {};

    if (category && category !== 'all') {
      const mappedCategory = categoryMap[category as string];
      if (mappedCategory) {
        where.category = mappedCategory;
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } }
      ];
    }

    const [dishes, total] = await Promise.all([
      prisma.dish.findMany({
        where,
        include: { images: true },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: (Number(page) - 1) * Number(limit)
      }),
      prisma.dish.count({ where })
    ]);

    return res.json({
      success: true,
      data: dishes.map(transformDish),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Ошибка получения блюд:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};

// Создать новое блюдо
export const createDish = async (req: Request, res: Response): Promise<Response> => {
  try {
    const validatedData = dishSchema.parse(req.body);
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Необходимо загрузить хотя бы одно изображение'
      });
    }

    // Создаем блюдо
    const mappedCategory = categoryMap[validatedData.category];
    if (!mappedCategory) {
      return res.status(400).json({
        success: false,
        message: 'Неверная категория'
      });
    }

    const dish = await prisma.dish.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        category: mappedCategory,
        price: validatedData.price,
        weight: validatedData.weight,
        calories: validatedData.calories,
        ingredients: validatedData.ingredients || '[]',
        isSpicy: validatedData.isSpicy || false,
        isVegetarian: validatedData.isVegetarian || false,
        isNew: validatedData.isNew || false,
        isPopular: validatedData.isPopular || false,
        stock: validatedData.stock || 100,
        isAvailable: validatedData.isAvailable !== false,
        images: {
          create: files.map((file, index) => ({
            path: `/uploads/dishes/${file.filename}`,
            isMain: index === 0
          }))
        }
      },
      include: { images: true }
    });

    return res.status(201).json({
      success: true,
      message: 'Блюдо создано успешно',
      data: transformDish(dish)
    });
  } catch (error) {
    console.error('Ошибка создания блюда:', error);

    // Удаляем загруженные файлы при ошибке
    const files = req.files as Express.Multer.File[];
    if (files) {
      files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Ошибка удаления файла:', err);
        });
      });
    }

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Ошибка валидации данных',
        errors: error.errors.map(err => err.message)
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};

// Обновить блюдо
export const updateDish = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];

    const dish = await prisma.dish.findUnique({
      where: { id: Number(id) },
      include: { images: true }
    });

    if (!dish) {
      return res.status(404).json({
        success: false,
        message: 'Блюдо не найдено'
      });
    }

    // Подготавливаем данные для обновления
    const updateData: any = {};

    if (req.body.name) updateData.name = req.body.name;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.category) updateData.category = categoryMap[req.body.category];
    if (req.body.price) updateData.price = Number(req.body.price);
    if (req.body.weight) updateData.weight = Number(req.body.weight);
    if (req.body.calories) updateData.calories = Number(req.body.calories);
    if (req.body.ingredients) {
      updateData.ingredients = typeof req.body.ingredients === 'string'
        ? req.body.ingredients
        : JSON.stringify(req.body.ingredients);
    }
    if (req.body.isSpicy !== undefined) updateData.isSpicy = req.body.isSpicy === true || req.body.isSpicy === 'true';
    if (req.body.isVegetarian !== undefined) updateData.isVegetarian = req.body.isVegetarian === true || req.body.isVegetarian === 'true';
    if (req.body.isNew !== undefined) updateData.isNew = req.body.isNew === true || req.body.isNew === 'true';
    if (req.body.isPopular !== undefined) updateData.isPopular = req.body.isPopular === true || req.body.isPopular === 'true';
    if (req.body.stock !== undefined) updateData.stock = Number(req.body.stock);
    if (req.body.isAvailable !== undefined) updateData.isAvailable = req.body.isAvailable === true || req.body.isAvailable === 'true';

    // Если загружены новые изображения
    if (files && files.length > 0) {
      // Удаляем старые изображения
      for (const image of dish.images) {
        const fullPath = path.join(process.cwd(), image.path);
        fs.unlink(fullPath, (err) => {
          if (err) console.error('Ошибка удаления старого изображения:', err);
        });
      }

      // Удаляем записи о старых изображениях
      await prisma.dishImage.deleteMany({
        where: { dishId: dish.id }
      });

      // Создаем новые записи изображений
      await prisma.dishImage.createMany({
        data: files.map((file, index) => ({
          dishId: dish.id,
          path: `/uploads/dishes/${file.filename}`,
          isMain: index === 0
        }))
      });
    }

    const updatedDish = await prisma.dish.update({
      where: { id: Number(id) },
      data: updateData,
      include: { images: true }
    });

    return res.json({
      success: true,
      message: 'Блюдо обновлено успешно',
      data: transformDish(updatedDish)
    });
  } catch (error) {
    console.error('Ошибка обновления блюда:', error);

    // Удаляем новые загруженные файлы при ошибке
    const files = req.files as Express.Multer.File[];
    if (files) {
      files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Ошибка удаления файла:', err);
        });
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};

// Удалить блюдо
export const deleteDish = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const dish = await prisma.dish.findUnique({
      where: { id: Number(id) },
      include: { images: true }
    });

    if (!dish) {
      return res.status(404).json({
        success: false,
        message: 'Блюдо не найдено'
      });
    }

    // Удаляем изображения
    dish.images.forEach((image: any) => {
      const fullPath = path.join(process.cwd(), image.path);
      fs.unlink(fullPath, (err) => {
        if (err) console.error('Ошибка удаления изображения:', err);
      });
    });

    await prisma.dish.delete({
      where: { id: Number(id) }
    });

    return res.json({
      success: true,
      message: 'Блюдо удалено успешно'
    });
  } catch (error) {
    console.error('Ошибка удаления блюда:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};

// Получить все заказы (для админа)
export const getAllOrders = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status.toString().toUpperCase().replace(/-/g, '_');
    }

    if (search) {
      where.orderNumber = { contains: search as string };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true }
          },
          items: {
            include: {
              dish: {
                select: { id: true, name: true, price: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: (Number(page) - 1) * Number(limit)
      }),
      prisma.order.count({ where })
    ]);

    return res.json({
      success: true,
      data: orders.map((order: any) => ({
        ...order,
        _id: order.id.toString(),
        status: order.status.toLowerCase().replace(/_/g, '-'),
        totalAmount: Number(order.totalAmount),
        deliveryFee: Number(order.deliveryFee),
        finalAmount: Number(order.finalAmount),
        items: order.items.map((item: any) => ({
          ...item,
          price: Number(item.price)
        }))
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Ошибка получения заказов:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};

// Обновить статус заказа
export const updateOrderStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'on-the-way', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Неверный статус заказа'
      });
    }

    const prismaStatus = status.toUpperCase().replace(/-/g, '_');

    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: {
        status: prismaStatus,
        ...(adminComment && { adminComment })
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        },
        items: {
          include: {
            dish: true
          }
        }
      }
    });

    return res.json({
      success: true,
      message: 'Статус заказа обновлен',
      data: {
        ...order,
        _id: order.id.toString(),
        status: order.status.toLowerCase().replace(/_/g, '-'),
        totalAmount: Number(order.totalAmount),
        deliveryFee: Number(order.deliveryFee),
        finalAmount: Number(order.finalAmount)
      }
    });
  } catch (error) {
    console.error('Ошибка обновления статуса заказа:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};

// Получить статистику
export const getStats = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Статистика за сегодня
    const todayOrders = await prisma.order.count({
      where: {
        createdAt: { gte: today, lt: tomorrow }
      }
    });

    const todayRevenueResult = await prisma.order.aggregate({
      where: {
        createdAt: { gte: today, lt: tomorrow },
        status: { not: 'CANCELLED' }
      },
      _sum: { finalAmount: true }
    });

    // Общая статистика
    const totalOrders = await prisma.order.count();
    const totalRevenueResult = await prisma.order.aggregate({
      where: { status: { not: 'CANCELLED' } },
      _sum: { finalAmount: true }
    });

    const totalDishes = await prisma.dish.count();
    const totalUsers = await prisma.user.count();

    // Статусы заказов
    const orderStatuses = await prisma.order.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    return res.json({
      success: true,
      data: {
        today: {
          orders: todayOrders,
          revenue: Number(todayRevenueResult._sum.finalAmount) || 0
        },
        total: {
          orders: totalOrders,
          revenue: Number(totalRevenueResult._sum.finalAmount) || 0,
          dishes: totalDishes,
          users: totalUsers
        },
        orderStatuses: orderStatuses.map((s: any) => ({
          _id: s.status.toLowerCase().replace(/_/g, '-'),
          count: s._count.status
        }))
      }
    });
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};