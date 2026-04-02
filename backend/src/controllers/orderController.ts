import { Request, Response } from 'express';
import prisma from '../config/database';
import { z } from 'zod';

interface AuthRequest extends Request {
  user?: { id: number };
}

// Типы категорий
type CategoryEnum = 'SIGNATURE_BURGERS' | 'CLASSIC_BURGERS' | 'CHICKEN_SIDES' | 'FRIES_SNACKS' | 'DRINKS_SHAKES' | 'DESSERTS';

const reverseCategoryMap: Record<CategoryEnum, string> = {
  'SIGNATURE_BURGERS': 'signature-burgers',
  'CLASSIC_BURGERS': 'classic-burgers',
  'CHICKEN_SIDES': 'chicken-sides',
  'FRIES_SNACKS': 'fries-snacks',
  'DRINKS_SHAKES': 'drinks-shakes',
  'DESSERTS': 'desserts'
};

// Схема валидации для создания заказа
const createOrderSchema = z.object({
  deliveryAddress: z.object({
    street: z.string().min(5, 'Адрес должен содержать минимум 5 символов'),
    apartment: z.string().optional(),
    floor: z.string().optional(),
    comment: z.string().optional()
  }),
  deliveryTime: z.string().refine(date => new Date(date) > new Date(), {
    message: 'Время доставки должно быть в будущем'
  }),
  paymentMethod: z.enum(['cash', 'card']),
  customerComment: z.string().max(500).optional()
});

// Генерация номера заказа
const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `BD-${timestamp}-${random}`.toUpperCase();
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
  stock: dish.stock,
  isAvailable: dish.isAvailable
});

// Создать заказ
export const createOrder = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const validatedData = createOrderSchema.parse(req.body);
    const userId = req.user!.id;

    // Получаем корзину пользователя
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        dish: {
          include: { images: true }
        }
      }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Корзина пуста'
      });
    }

    // Проверяем доступность всех блюд и вычисляем стоимость
    let totalAmount = 0;
    const orderItems: { dishId: number; quantity: number; price: number }[] = [];

    for (const cartItem of cartItems) {
      const dish = cartItem.dish;

      if (!dish.isAvailable || dish.stock === 0) {
        return res.status(400).json({
          success: false,
          message: `Блюдо "${dish.name}" недоступно`
        });
      }

      const itemTotal = Number(dish.price) * cartItem.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        dishId: dish.id,
        quantity: cartItem.quantity,
        price: Number(dish.price)
      });
    }

    // Проверяем минимальную сумму заказа
    const deliveryFee = 250;
    const minOrderAmount = 1200;

    if (totalAmount < minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Минимальная сумма заказа: ${minOrderAmount} руб.`
      });
    }

    const finalAmount = totalAmount + deliveryFee;

    // Создаем заказ
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        totalAmount,
        deliveryFee,
        finalAmount,
        status: 'PENDING',
        street: validatedData.deliveryAddress.street,
        apartment: validatedData.deliveryAddress.apartment || null,
        floor: validatedData.deliveryAddress.floor || null,
        addressComment: validatedData.deliveryAddress.comment || null,
        deliveryTime: new Date(validatedData.deliveryTime),
        paymentMethod: validatedData.paymentMethod === 'cash' ? 'CASH' : 'CARD',
        customerComment: validatedData.customerComment || null,
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            dish: {
              include: { images: true }
            }
          }
        },
        user: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });

    // Очищаем корзину после успешного создания заказа
    await prisma.cartItem.deleteMany({
      where: { userId }
    });

    return res.status(201).json({
      success: true,
      message: 'Заказ создан успешно',
      data: {
        ...order,
        items: order.items.map((item: any) => ({
          ...item,
          dish: transformDish(item.dish),
          price: Number(item.price)
        })),
        totalAmount: Number(order.totalAmount),
        deliveryFee: Number(order.deliveryFee),
        finalAmount: Number(order.finalAmount)
      }
    });
  } catch (error) {
    console.error('Ошибка создания заказа:', error);

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

// Получить заказы пользователя
export const getUserOrders = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 10 } = req.query;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              dish: {
                include: { images: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: (Number(page) - 1) * Number(limit)
      }),
      prisma.order.count({ where: { userId } })
    ]);

    return res.json({
      success: true,
      data: orders.map((order: any) => ({
        ...order,
        items: order.items.map((item: any) => ({
          ...item,
          dish: transformDish(item.dish),
          price: Number(item.price)
        })),
        totalAmount: Number(order.totalAmount),
        deliveryFee: Number(order.deliveryFee),
        finalAmount: Number(order.finalAmount)
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

// Получить заказ по ID
export const getOrderById = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const order = await prisma.order.findFirst({
      where: {
        id: Number(id),
        userId
      },
      include: {
        items: {
          include: {
            dish: {
              include: { images: true }
            }
          }
        },
        user: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Заказ не найден'
      });
    }

    return res.json({
      success: true,
      data: {
        ...order,
        items: order.items.map((item: any) => ({
          ...item,
          dish: transformDish(item.dish),
          price: Number(item.price)
        })),
        totalAmount: Number(order.totalAmount),
        deliveryFee: Number(order.deliveryFee),
        finalAmount: Number(order.finalAmount)
      }
    });
  } catch (error) {
    console.error('Ошибка получения заказа:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};

// Отменить заказ (только если статус pending)
export const cancelOrder = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const order = await prisma.order.findFirst({
      where: {
        id: Number(id),
        userId
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Заказ не найден'
      });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Заказ нельзя отменить'
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { status: 'CANCELLED' }
    });

    return res.json({
      success: true,
      message: 'Заказ отменен',
      data: {
        ...updatedOrder,
        totalAmount: Number(updatedOrder.totalAmount),
        deliveryFee: Number(updatedOrder.deliveryFee),
        finalAmount: Number(updatedOrder.finalAmount)
      }
    });
  } catch (error) {
    console.error('Ошибка отмены заказа:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};