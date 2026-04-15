import { Router } from 'express';
import { getPolicies, updatePolicy } from '../controllers/policy.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { isAdmin, isStaff } from '../middlewares/role.middleware';

const router = Router();

router.get('/', [verifyToken, isStaff], getPolicies);
router.put('/:id', [verifyToken, isAdmin], updatePolicy);

export default router;
