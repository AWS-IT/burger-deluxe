import { Request, Response, NextFunction } from 'express';

interface ErrorWithStatus extends Error {
  statusCode?: number;
  status?: number;
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
}

export const errorHandler = (
  error: ErrorWithStatus,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  console.error(error.stack);

  // Mongoose validation error
  if (error.name === 'ValidationError' && error.errors) {
    const validationErrors = Object.values(error.errors).map(
      (err) => err.message
    );
    return res.status(400).json({
      success: false,
      message: 'Ошибка валидации данных',
      errors: validationErrors
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000 && error.keyValue) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} уже существует`
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Недействительный токен'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Токен истек'
    });
  }

  // Cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Неверный формат ID'
    });
  }

  // Default error
  const statusCode = error.statusCode || error.status || 500;
  const message = error.message || 'Внутренняя ошибка сервера';

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

export default errorHandler;