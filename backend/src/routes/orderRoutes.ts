import { Router } from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder
} from '../controllers/orderController';
import { auth, orderLimiter } from '../middleware';

const router = Router();

// Все маршруты заказов требуют аутентификации
router.use(auth);

router.post('/', orderLimiter, createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

export default router;