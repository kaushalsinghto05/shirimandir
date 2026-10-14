import express from 'express';
import { 
  register, 
  login, 
  getProfile, 
  completeProfile, 
  updateConsent, 
  changeUserRole, 
  createAdmin, 
  getAllUsers 
} from './identity.controller.js';
import { authenticate, requireRole } from '../../core/middleware/auth.js';

const router = express.Router();

// Public Auth Endpoints
router.post('/register', register);
router.post('/login', login);

// Authenticated Devotee Endpoints
router.get('/me', authenticate, getProfile);
router.put('/complete-profile', authenticate, completeProfile);
router.put('/consent', authenticate, updateConsent);

// Super Admin Only: Role management & creating admins
router.get('/users', authenticate, requireRole(['super_admin']), getAllUsers);
router.put('/users/:id/role', authenticate, requireRole(['super_admin']), changeUserRole);
router.post('/create-admin', authenticate, requireRole(['super_admin']), createAdmin);

export default router;
