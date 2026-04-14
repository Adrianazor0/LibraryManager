import { Router } from 'express';
import { createBorrow, returnBook, getBorrowsHistory, getActiveBorrows, requestBorrow, getMyBorrows, approveBorrow, rejectBorrow, getPendingRequests } from '../controllers/borrow.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 1. RUTAS ESTÁTICAS (Sin parámetros :id)
router.get('/actives', getActiveBorrows); // Mover arriba
router.get('/history', getBorrowsHistory);
router.get('/pending', verifyToken, getPendingRequests);
router.get('/my-borrows', verifyToken, getMyBorrows);

// 2. RUTAS DE ACCIÓN (POST)
router.post('/request', verifyToken, requestBorrow);
router.post('/create', createBorrow);

// 3. RUTAS CON PARÁMETROS (Siempre al final)
router.put('/return/:id', returnBook);
router.put('/approve/:id', verifyToken, approveBorrow);
router.delete('/reject/:id', verifyToken, rejectBorrow);


export default router;