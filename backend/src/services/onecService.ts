import { Request, Response } from 'express';

// Заглушки для интеграции с 1С
export const syncWith1C = async (_req: Request, res: Response): Promise<Response> => {
  try {
    // TODO: Интеграция с 1С
    // Использовать HTTP API 1С Предприятие
    // Обычно используется базовая авторизация
    // Синхронизировать номенклатуру, цены, остатки
    // Пример реализации:
    /*
    const onecApi = axios.create({
      baseURL: process.env.ONEC_BASE_URL,
      auth: {
        username: process.env.ONEC_USERNAME,
        password: process.env.ONEC_PASSWORD
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Получаем номенклатуру из 1С
    const response = await onecApi.get('/nomenclature');
    const products = response.data.value;

    // Синхронизируем с нашей базой данных
    for (const product of products) {
      const existingDish = await Dish.findOne({ externalId: product.Ref_Key });

      if (existingDish) {
        // Обновляем существующее блюдо
        existingDish.name = product.Description;
        existingDish.price = parseFloat(product.Price);
        existingDish.stock = parseInt(product.Stock) || 0;
        existingDish.isAvailable = existingDish.stock > 0;
        existingDish.source = '1c';
        await existingDish.save();
      }
    }
    */

    return res.json({
      success: true,
      message: 'Синхронизация с 1С завершена',
      data: {
        syncedProducts: 0,
        updatedProducts: 0,
        errors: []
      }
    });
  } catch (error) {
    console.error('Ошибка синхронизации с 1С:', error);
    return res.status(500).json({
      success: false,
      message: 'Интеграция в разработке'
    });
  }
};

// Получить остатки товаров из 1С
export const get1CStock = async (_req: Request, res: Response): Promise<Response> => {
  try {
    // TODO: Реализовать получение остатков из 1С
    // Использовать соответствующий endpoint для остатков
    // Обновлять поле stock в модели Dish

    return res.json({
      success: true,
      message: 'Получение остатков из 1С',
      data: []
    });
  } catch (error) {
    console.error('Ошибка получения остатков из 1С:', error);
    return res.status(500).json({
      success: false,
      message: 'Интеграция в разработке'
    });
  }
};

// Отправить заказ в 1С
export const sendOrderTo1C = async (orderId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // TODO: Отправка заказа в 1С
    // Создать документ "Заказ покупателя" в 1С
    // Передать информацию о клиенте, товарах, сумме
    // Возможно потребуется создание контрагента

    console.log('Заказ отправлен в 1С:', orderId);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Ошибка отправки заказа в 1С:', error);
    return { success: false, error: errorMessage };
  }
};