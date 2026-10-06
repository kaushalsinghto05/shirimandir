import { Router } from 'express';
import { register, login, getProfile, updateConsent } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getProfile);
router.put('/consent', authenticate, updateConsent);

export default router;
