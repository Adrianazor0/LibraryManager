import { Router } from 'express';
import { getLogs } from '../controllers/log.controller';
import { getDashboardStats } from '../controllers/report.controller';
// import { authMiddleware } from '../middlewares/auth'; // Asegúrate de protegerlas

const router = Router();

router.get('/logs', getLogs);
router.get('/stats', getDashboardStats);

export default router;