import { Router } from 'express';
import {
  getAllDishesAdmin,
  createDish,
  updateDish,
  deleteDish,
  getAllOrders,
  updateOrderStatus,
  getStats
} from '../controllers/adminController';
import { adminAuth, uploadMultiple, handleUploadErrors, uploadLimiter } from '../middleware';

const router = Router();

// Все маршруты админки требуют права администратора
router.use(adminAuth);

// Маршруты для управления блюдами
router.get('/dishes', getAllDishesAdmin);
router.post('/dishes', uploadLimiter, uploadMultiple, handleUploadErrors, createDish);
router.put('/dishes/:id', uploadLimiter, uploadMultiple, handleUploadErrors, updateDish);
router.delete('/dishes/:id', deleteDish);

// Маршруты для управления заказами
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Статистика
router.get('/stats', getStats);

export default router;