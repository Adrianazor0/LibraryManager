import { Router } from 'express';
import { createBorrow, returnBook, getBorrowsHistory, getActiveBorrows, requestBorrow, getMyBorrows, approveBorrow, rejectBorrow, getPendingRequests } from '../controllers/borrow.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { isStaff } from '../middlewares/role.middleware';

const router = Router();

// 1. RUTAS DE ADMINISTRACIÓN / STAFF
router.get('/actives', [verifyToken, isStaff], getActiveBorrows); 
router.get('/history', [verifyToken, isStaff], getBorrowsHistory);
router.get('/pending', [verifyToken, isStaff], getPendingRequests);
router.post('/create', [verifyToken, isStaff], createBorrow);
router.put('/return/:id', [verifyToken, isStaff], returnBook);
router.put('/approve/:id', [verifyToken, isStaff], approveBorrow);
router.delete('/reject/:id', [verifyToken, isStaff], rejectBorrow);

// 2. RUTAS DE USUARIO
router.get('/my-borrows', verifyToken, getMyBorrows);
router.post('/request', verifyToken, requestBorrow);


export default router;