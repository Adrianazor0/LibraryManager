import { Router } from 'express';
import { createBook, updateBook, getAllBooks, deleteBook } from '../controllers/book.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';

const router = Router();

    
router.get('/catalog', verifyToken, getAllBooks);
router.post('/register', [verifyToken, isAdmin], createBook);
router.put('/update/:id', [verifyToken, isAdmin], updateBook);
router.delete('/:id', [verifyToken, isAdmin], deleteBook);
export default router;