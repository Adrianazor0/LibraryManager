import { Router } from 'express';
import { createBorrow, returnBorrow, getBorrowsHistory } from '../controllers/borrow.controller';

const router = Router();

router.get('/history', getBorrowsHistory);
router.post('/borrow', createBorrow);
router.put('/borrow/:id', returnBorrow);

export default router;