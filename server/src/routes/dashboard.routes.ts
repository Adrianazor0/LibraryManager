import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Esta es la ruta que llamará el hook useDashboard
router.get('/stats', verifyToken, getDashboardStats);

export default router;