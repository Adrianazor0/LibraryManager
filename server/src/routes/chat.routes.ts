import { Router } from 'express';
import { askLibraryBot } from '../controllers/chat.controller';

const router = Router();

// Permitir consultas 24/7 tanto a usuarios autenticados como a visitantes de la app
router.post('/ask', askLibraryBot);

export default router;
