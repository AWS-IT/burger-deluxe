import { Router } from 'express';
import {
  getDishes,
  getDishById,
  getPopularDishes,
  getNewDishes,
  getCategories
} from '../controllers/dishController';

const router = Router();

// Публичные маршруты
router.get('/', getDishes);
router.get('/popular', getPopularDishes);
router.get('/new', getNewDishes);
router.get('/categories', getCategories);
router.get('/:id', getDishById);

export default router;