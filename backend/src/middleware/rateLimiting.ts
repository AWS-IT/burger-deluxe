import rateLimit from 'express-rate-limit';

// Общее ограничение для API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов за окно
  message: {
    success: false,
    message: 'Слишком много запросов. Попробуйте позже.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Ограничение для аутентификации
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 попыток входа за окно
  message: {
    success: false,
    message: 'Слишком много попыток входа. Попробуйте через 15 минут.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Не учитывать успешные запросы
});

// Ограничение для создания заказов
export const orderLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 минут
  max: 3, // максимум 3 заказа за 5 минут
  message: {
    success: false,
    message: 'Слишком много заказов. Попробуйте через 5 минут.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Ограничение для загрузки файлов
export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 минут
  max: 20, // максимум 20 загрузок за окно
  message: {
    success: false,
    message: 'Слишком много загрузок файлов. Попробуйте позже.'
  },
  standardHeaders: true,
  legacyHeaders: false
});