import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';

import prisma from './config/database';
import { errorHandler, apiLimiter } from './middleware';
import {
  authRoutes,
  dishRoutes,
  cartRoutes,
  orderRoutes,
  adminRoutes
} from './routes';
import { syncWithMoySklad, getMoySkladStock } from './services/moyskladService';
import { syncWith1C, get1CStock } from './services/onecService';

// Загружаем переменные окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Статические файлы (изображения)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limiting
app.use('/api', apiLimiter);

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Маршруты для интеграций (заглушки)
app.post('/api/sync/moysklad', syncWithMoySklad);
app.get('/api/sync/moysklad/stock', getMoySkladStock);
app.post('/api/sync/1c', syncWith1C);
app.get('/api/sync/1c/stock', get1CStock);

// Health check
app.get('/api/health', async (_req, res) => {
  try {
    // Проверяем подключение к БД
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      message: 'Server is running',
      database: 'MySQL connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection error',
      timestamp: new Date().toISOString()
    });
  }
});

// Обработка несуществующих маршрутов
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Маршрут ${req.originalUrl} не найден`
  });
});

// Обработчик ошибок (должен быть последним)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️  База данных: MySQL`);
});