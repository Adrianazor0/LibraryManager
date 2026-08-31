import { Router } from 'express';
import { createBook, updateBook, getAllBooks, deleteBook, searchBooksSemantic, scanBookOCR, getRecommendationsByGrade } from '../controllers/book.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { isAdmin, isStaff } from '../middlewares/role.middleware';

const router = Router();

router.get('/catalog', verifyToken, getAllBooks);
router.get('/search-semantic', verifyToken, searchBooksSemantic);
router.get('/recommendations', verifyToken, getRecommendationsByGrade);
router.get('/recommendations/:grade', verifyToken, getRecommendationsByGrade);
router.post('/ocr-scan', [verifyToken, isStaff], scanBookOCR);
router.post('/register', [verifyToken, isStaff], createBook);
router.put('/update/:id', [verifyToken, isStaff], updateBook);
router.delete('/:id', [verifyToken, isStaff], deleteBook);
export default router;