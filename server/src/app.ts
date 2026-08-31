import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

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
import chatRoutes from './routes/chat.routes';
import { seedPolicies } from './models/LibraryPolicy';

// Cargar variables de entorno lo antes posible
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8080;

// Configuración Global Dinámica de CORS (Permite Vercel, Firebase, APK Móvil y Localhost)
app.use(cors({
  origin: (origin, callback) => {
    // Permitir solicitudes sin origen (mobile apps, Postman) o desde Vercel, Render, Firebase y Localhost
    if (!origin || origin.includes('vercel.app') || origin.includes('web.app') || origin.includes('localhost') || origin.includes('onrender.com')) {
      callback(null, true);
    } else {
      callback(null, true); // Permitir acceso universal para la biblioteca
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'Accept'],
  credentials: true
}));

// Middleware básico
app.use(morgan('dev')); 
app.use(express.json()); 

// Health Check para Cloud Run / Render
app.get('/', (req, res) => {
  res.status(200).send('<h1>Biblioteca Liceo La Ureña API - ONLINE 🚀</h1>');
});

// Rutas de la API Principal
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrows', borrowRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', report);
app.use('/api/policies', policyRoutes);
app.use('/api/chat', chatRoutes);

// Aliases directos para compatibilidad (/auth/signin -> /api/auth/signin)
app.use('/auth', authRoutes);
app.use('/books', bookRoutes);
app.use('/borrows', borrowRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ msg: `Ruta no encontrada: ${req.method} ${req.url}` });
});

// Iniciar el servidor inmediatamente para pasar el health check de Cloud Run / Render
const server = app.listen(PORT, () => {
    console.log(`>>> SERVER LIVE ON PORT ${PORT} <<<`);
    
    // Inicialización en segundo plano (DB y Semillas)
    connectDB().then(() => {
        console.log("Conectado a MongoDB Atlas");
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
