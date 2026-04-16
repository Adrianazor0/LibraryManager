import { Router } from 'express';
import { getPolicies, updatePolicy, createPolicy } from '../controllers/policy.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { isAdmin, isStaff } from '../middlewares/role.middleware';

const router = Router();

router.get('/', [verifyToken, isStaff], getPolicies);
router.post('/', [verifyToken, isAdmin], createPolicy);
router.put('/:id', [verifyToken, isAdmin], updatePolicy);

export default router;
