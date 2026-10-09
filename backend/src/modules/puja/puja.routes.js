import { Router } from 'express';
import { getAllPujas, getPujaById } from './puja.controller.js';

const router = Router();

router.get('/', getAllPujas);
router.get('/:id', getPujaById);

export default router;
