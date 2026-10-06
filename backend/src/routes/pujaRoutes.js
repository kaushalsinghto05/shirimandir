import { Router } from 'express';
import { getAllPujas, getPujaById } from '../controllers/pujaController.js';

const router = Router();

router.get('/', getAllPujas);
router.get('/:id', getPujaById);

export default router;
