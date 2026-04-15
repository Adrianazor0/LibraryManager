import { Router } from 'express';
import { getUser, createUser, deleteUser, updateUser } from '../controllers/user.Controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { isAdmin, isStaff } from '../middlewares/role.middleware';

const router = Router();

router.get('/', [verifyToken, isStaff], getUser); 
router.post('/', [verifyToken, isAdmin], createUser);
router.put('/update/:id', [verifyToken, isAdmin], updateUser);
router.delete('/:id', [verifyToken, isAdmin], deleteUser);

export default router;