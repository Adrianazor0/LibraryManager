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


dotenv.config();
const app: Application = express();

// Health Check para probar en el navegador
app.get('/', (req, res) => {
  res.status(200).send('<h1>Biblioteca API - ONLINE</h1>');
});

// DEBUG: Log para ver qué llega al servidor
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// Configuración de CORS con la librería oficial (más segura)
app.use(cors({
  origin: true, // Permite cualquier origen que haga la petición
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
}));

// Manejo explícito de preflight
app.options('*', cors());

// Inicialización de DB y Servidor
const startServer = async () => {
  const PORT = Number(process.env.PORT) || 8080;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> SERVER LIVE ON PORT ${PORT} (0.0.0.0) <<<`);
  });

  try {
    await connectDB();
    console.log("Conectado a MongoDB");
    await seedPolicies();
    console.log("Políticas verificadas/inicializadas");
  } catch (error) {
    console.error("Error durante la inicialización:", error);
  }
};

startServer();

app.use(morgan('dev')); 
app.use(express.json()); 

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrows', borrowRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', report);
app.use('/api/policies', policyRoutes);

// Catch-all route for any undefined routes
app.use((req, res) => {
  res.status(404).json({ msg: `Ruta no encontrada: ${req.method} ${req.url}` });
});

export default app;