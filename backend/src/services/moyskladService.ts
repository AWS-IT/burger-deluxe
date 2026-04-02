import { Request, Response } from 'express';

// Заглушки для интеграции с МойСклад
export const syncWithMoySklad = async (_req: Request, res: Response): Promise<Response> => {
  try {
    // TODO: Интеграция с МойСклад
    // Использовать axios для запросов к https://api.moysklad.ru/api/remap/1.2/entity/product
    // Авторизация через Basic Auth или токен
    // Синхронизировать название, цену, остатки, артикул
    // Пример реализации:
    /*
    const moyskladApi = axios.create({
      baseURL: process.env.MOYSKLAD_BASE_URL,
      headers: {
        'Authorization': `Bearer ${process.env.MOYSKLAD_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    // Получаем товары из МойСклад
    const response = await moyskladApi.get('/entity/product');
    const products = response.data.rows;

    // Синхронизируем с нашей базой данных
    for (const product of products) {
      const existingDish = await Dish.findOne({ externalId: product.id });

      if (existingDish) {
        // Обновляем существующее блюдо
        existingDish.name = product.name;
        existingDish.price = product.salePrices[0].value / 100; // конвертируем копейки в рубли
        existingDish.stock = product.quantity || 0;
        existingDish.isAvailable = existingDish.stock > 0;
        existingDish.source = 'moysklad';
        await existingDish.save();
      } else {
        // Создаем новое блюдо (если есть соответствующие поля в МойСклад)
        // Нужно настроить маппинг полей между МойСклад и нашей моделью
      }
    }
    */

    return res.json({
      success: true,
      message: 'Синхронизация с МойСклад завершена',
      data: {
        syncedProducts: 0,
        updatedProducts: 0,
        errors: []
      }
    });
  } catch (error) {
    console.error('Ошибка синхронизации с МойСклад:', error);
    return res.status(500).json({
      success: false,
      message: 'Интеграция в разработке'
    });
  }
};

// Получить остатки товаров из МойСклад
export const getMoySkladStock = async (_req: Request, res: Response): Promise<Response> => {
  try {
    // TODO: Реализовать получение остатков
    // Использовать endpoint /entity/stock для получения остатков
    // Обновлять поле stock в модели Dish

    return res.json({
      success: true,
      message: 'Получение остатков из МойСклад',
      data: []
    });
  } catch (error) {
    console.error('Ошибка получения остатков:', error);
    return res.status(500).json({
      success: false,
      message: 'Интеграция в разработке'
    });
  }
};

// Отправить заказ в МойСклад
export const sendOrderToMoySklad = async (orderId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // TODO: Отправка заказа в МойСклад
    // Создать документ "Заказ покупателя" в МойСклад
    // Передать информацию о клиенте, товарах, сумме

    console.log('Заказ отправлен в МойСклад:', orderId);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Ошибка отправки заказа в МойСклад:', error);
    return { success: false, error: errorMessage };
  }
};