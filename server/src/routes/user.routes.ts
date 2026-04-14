import { Router } from 'express';
import { getUser, createUser, deleteUser, updateUser } from '../controllers/user.Controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', verifyToken, getUser); 
router.post('/', verifyToken, createUser);
router.put('/update/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;