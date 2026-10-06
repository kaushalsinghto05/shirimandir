import { Router } from 'express';
import {
  calculateCheckout,
  createOrder,
  getMyOrders,
  getOrderById
} from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Transparent pre-checkout calculation (can be checked before login or during cart preview)
router.post('/calculate', calculateCheckout);

router.post('/', authenticate, createOrder);
router.get('/my', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderById);

export default router;
