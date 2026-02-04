import { Router } from 'express';
import { signIn, signUp } from '../controllers/auth.controller';

const router = Router();

// /api/auth/registrar
router.post('/signup', signUp);

// /api/auth/login
router.post('/signin', signIn);

export default router;