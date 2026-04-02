import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController';
import { auth } from '../middleware';

const router = Router();

// Все маршруты корзины требуют аутентификации
router.use(auth);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/item/:dishId', updateCartItem);
router.delete('/item/:dishId', removeFromCart);
router.delete('/clear', clearCart);

export default router;