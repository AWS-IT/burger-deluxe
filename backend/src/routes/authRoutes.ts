import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile
} from '../controllers/authController';
import { auth, authLimiter } from '../middleware';

const router = Router();

// Публичные маршруты
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);

// Защищенные маршруты
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);

export default router;