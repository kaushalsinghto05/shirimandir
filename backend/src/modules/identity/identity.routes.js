import express from 'express';
import { register, login, getProfile, updateConsent } from './identity.controller.js';
import { authenticate } from '../../core/middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getProfile);
router.put('/consent', authenticate, updateConsent);

export default router;
