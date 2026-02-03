import { Router } from 'express';
import { registrarLibro, obtenerCatalogo } from '../controllers/libro.controller';

const router = Router();

router.post('/api/registrar', registrarLibro);
router.get('/api/catalogo', obtenerCatalogo); 

export default router;