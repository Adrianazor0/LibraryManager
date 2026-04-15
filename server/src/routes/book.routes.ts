import { Router } from 'express';
import { createBook, updateBook, getAllBooks, deleteBook } from '../controllers/book.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { isAdmin, isStaff } from '../middlewares/role.middleware';

const router = Router();

    
router.get('/catalog', verifyToken, getAllBooks);
router.post('/register', [verifyToken, isStaff], createBook);
router.put('/update/:id', [verifyToken, isStaff], updateBook);
router.delete('/:id', [verifyToken, isStaff], deleteBook);
export default router;