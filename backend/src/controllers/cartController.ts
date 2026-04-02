import { Request, Response } from 'express';
import prisma from '../config/database';
import { z } from 'zod';

interface AuthRequest extends Request {
  user?: { id: number };
}

// Схема валидации для добавления в корзину
const addToCartSchema = z.object({
  dishId: z.union([z.string(), z.number()]).transform(val => Number(val)),
  quantity: z.number().min(1, 'Количество должно быть больше 0').max(10, 'Максимальное количество: 10')
});

// Преобразование блюда для API
const transformDish = (dish: any) => ({
  _id: dish.id.toString(),
  id: dish.id.toString(),
  name: dish.name,
  description: dish.description,
  category: dish.category,
  price: Number(dish.price),
  weight: dish.weight,
  calories: dish.calories,
  images: dish.images?.map((img: any) => img.path) || [],
  ingredients: JSON.parse(dish.ingredients || '[]'),
  isSpicy: dish.isSpicy,
  isVegetarian: dish.isVegetarian,
  isNewDish: dish.isNew,
  isPopular: dish.isPopular,
  stock: dish.stock,
  isAvailable: dish.isAvailable
});

// Хелпер для форматирования корзины
const formatCartResponse = (cartItems: any[]) => {
  const totalAmount = cartItems.reduce((sum: number, item: any) => {
    return sum + (Number(item.dish.price) * item.quantity);
  }, 0);

  const items = cartItems.map((item: any) => ({
    id: item.id,
    quantity: item.quantity,
    dish: transformDish(item.dish)
  }));

  return {
    items,
    totalAmount,
    deliveryFee: 250,
    finalAmount: totalAmount + 250
  };
};

// Получить корзину пользователя
export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        dish: {
          include: { images: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Фильтруем недоступные блюда
    const availableItems = cartItems.filter((item: any) =>
      item.dish.isAvailable && item.dish.stock > 0
    );

    // Удаляем недоступные товары из корзины
    if (availableItems.length !== cartItems.length) {
      const unavailableIds = cartItems
        .filter((item: any) => !item.dish.isAvailable || item.dish.stock === 0)
        .map((item: any) => item.id);

      await prisma.cartItem.deleteMany({
        where: { id: { in: unavailableIds } }
      });
    }

    res.json({
      success: true,
      data: formatCartResponse(availableItems)
    });
  } catch (error) {
    console.error('Ошибка получения корзины:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};

// Добавить товар в корзину
export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = addToCartSchema.parse(req.body);
    const userId = req.user!.id;

    // Проверяем существование блюда
    const dish = await prisma.dish.findUnique({
      where: { id: validatedData.dishId }
    });

    if (!dish) {
      res.status(404).json({
        success: false,
        message: 'Блюдо не найдено'
      });
      return;
    }

    if (!dish.isAvailable || dish.stock === 0) {
      res.status(400).json({
        success: false,
        message: 'Блюдо недоступно'
      });
      return;
    }

    // Проверяем, есть ли уже это блюдо в корзине
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_dishId: {
          userId,
          dishId: validatedData.dishId
        }
      }
    });

    if (existingItem) {
      // Обновляем количество
      const newQuantity = existingItem.quantity + validatedData.quantity;
      if (newQuantity > 10) {
        res.status(400).json({
          success: false,
          message: 'Максимальное количество: 10'
        });
        return;
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity }
      });
    } else {
      // Добавляем новый товар
      await prisma.cartItem.create({
        data: {
          userId,
          dishId: validatedData.dishId,
          quantity: validatedData.quantity
        }
      });
    }

    // Возвращаем обновленную корзину
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        dish: {
          include: { images: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Товар добавлен в корзину',
      data: formatCartResponse(cartItems)
    });
  } catch (error) {
    console.error('Ошибка добавления в корзину:', error);

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

// Обновить количество товара в корзине
export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dishId } = req.params;
    const { quantity } = req.body;
    const userId = req.user!.id;

    if (quantity < 1 || quantity > 10) {
      res.status(400).json({
        success: false,
        message: 'Количество должно быть от 1 до 10'
      });
      return;
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: {
        userId_dishId: {
          userId,
          dishId: Number(dishId)
        }
      }
    });

    if (!cartItem) {
      res.status(404).json({
        success: false,
        message: 'Товар не найден в корзине'
      });
      return;
    }

    await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity }
    });

    // Возвращаем обновленную корзину
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        dish: {
          include: { images: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Количество обновлено',
      data: formatCartResponse(cartItems)
    });
  } catch (error) {
    console.error('Ошибка обновления корзины:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};

// Удалить товар из корзины
export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dishId } = req.params;
    const userId = req.user!.id;

    await prisma.cartItem.deleteMany({
      where: {
        userId,
        dishId: Number(dishId)
      }
    });

    // Возвращаем обновленную корзину
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        dish: {
          include: { images: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Товар удален из корзины',
      data: formatCartResponse(cartItems)
    });
  } catch (error) {
    console.error('Ошибка удаления из корзины:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};

// Очистить корзину
export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    await prisma.cartItem.deleteMany({
      where: { userId }
    });

    res.json({
      success: true,
      message: 'Корзина очищена',
      data: {
        items: [],
        totalAmount: 0,
        deliveryFee: 250,
        finalAmount: 250
      }
    });
  } catch (error) {
    console.error('Ошибка очистки корзины:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};