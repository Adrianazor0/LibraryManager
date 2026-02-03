import { Router } from 'express';
import { registerBook, getCatalog } from '../controllers/libro.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';

const router = Router();

router.get('/catalogo', verifyToken, getCatalog);
router.post('/registrar', [verifyToken, isAdmin], registerBook);

export default router;