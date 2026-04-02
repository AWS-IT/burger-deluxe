import { Request, Response } from 'express';
import prisma from '../config/database';

// Типы категорий
type CategoryEnum = 'SIGNATURE_BURGERS' | 'CLASSIC_BURGERS' | 'CHICKEN_SIDES' | 'FRIES_SNACKS' | 'DRINKS_SHAKES' | 'DESSERTS';

// Маппинг категорий для API
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

// Получить все блюда с фильтрами
export const getDishes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, isPopular, isNew, page = 1, limit = 20 } = req.query;

    const where: any = { isAvailable: true };

    if (category && category !== 'all') {
      const mappedCategory = categoryMap[category as string];
      if (mappedCategory) {
        where.category = mappedCategory;
      }
    }

    if (isPopular === 'true') {
      where.isPopular = true;
    }

    if (isNew === 'true') {
      where.isNew = true;
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
        orderBy: [{ isPopular: 'desc' }, { createdAt: 'desc' }],
        take: Number(limit),
        skip: (Number(page) - 1) * Number(limit)
      }),
      prisma.dish.count({ where })
    ]);

    res.json({
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
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};

// Получить блюдо по ID
export const getDishById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const dish = await prisma.dish.findUnique({
      where: { id: Number(id) },
      include: { images: true }
    });

    if (!dish) {
      res.status(404).json({
        success: false,
        message: 'Блюдо не найдено'
      });
      return;
    }

    res.json({
      success: true,
      data: transformDish(dish)
    });
  } catch (error) {
    console.error('Ошибка получения блюда:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};

// Получить популярные блюда
export const getPopularDishes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const dishes = await prisma.dish.findMany({
      where: { isPopular: true, isAvailable: true },
      include: { images: true },
      take: 8,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: dishes.map(transformDish)
    });
  } catch (error) {
    console.error('Ошибка получения популярных блюд:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};

// Получить новые блюда
export const getNewDishes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const dishes = await prisma.dish.findMany({
      where: { isNew: true, isAvailable: true },
      include: { images: true },
      take: 6,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: dishes.map(transformDish)
    });
  } catch (error) {
    console.error('Ошибка получения новых блюд:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};

// Получить категории
export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = [
      { id: 'signature-burgers', name: 'Signature Burgers', description: 'Наши фирменные бургеры' },
      { id: 'classic-burgers', name: 'Classic Burgers', description: 'Классические бургеры' },
      { id: 'chicken-sides', name: 'Chicken & Sides', description: 'Курица и гарниры' },
      { id: 'fries-snacks', name: 'Fries & Snacks', description: 'Картофель и закуски' },
      { id: 'drinks-shakes', name: 'Drinks & Shakes', description: 'Напитки и коктейли' },
      { id: 'desserts', name: 'Desserts', description: 'Десерты' }
    ];

    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await prisma.dish.count({
          where: {
            category: categoryMap[category.id],
            isAvailable: true
          }
        });
        return { ...category, count };
      })
    );

    res.json({
      success: true,
      data: categoriesWithCount
    });
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};