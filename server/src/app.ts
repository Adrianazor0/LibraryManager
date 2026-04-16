import express, { Application } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import bookRoutes from './routes/book.routes';
import borrowRoutes from './routes/borrow.routes';
import userRoutes from './routes/user.routes';
import dashboardRoutes from './routes/dashboard.routes';
import report from './routes/report.routes';
import policyRoutes from './routes/policy.routes';
import { seedPolicies } from './models/LibraryPolicy';

// Cargar variables de entorno lo antes posible
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8080;

// Configuración de CORS
app.use(cors({
  origin: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
}));
app.options('*', cors());

// Middleware básico
app.use(morgan('dev')); 
app.use(express.json()); 

// Health Check para Cloud Run
app.get('/', (req, res) => {
  res.status(200).send('<h1>Biblioteca API - ONLINE</h1>');
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrows', borrowRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', report);
app.use('/api/policies', policyRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ msg: `Ruta no encontrada: ${req.method} ${req.url}` });
});

// Iniciar el servidor inmediatamente para pasar el health check de Cloud Run
const server = app.listen(PORT, () => {
    console.log(`>>> SERVER LIVE ON PORT ${PORT} <<<`);
    
    // Inicialización en segundo plano (DB y Semillas)
    connectDB().then(() => {
        console.log("Conectado a MongoDB");
        return seedPolicies();
    }).then(() => {
        console.log("Políticas verificadas/inicializadas");
    }).catch(error => {
        console.error("Error durante la inicialización en segundo plano:", error);
    });
});

// Manejo de errores del servidor
server.on('error', (err) => {
    console.error("Error crítico del servidor:", err);
});

export default app;
