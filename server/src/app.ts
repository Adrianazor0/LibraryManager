import express, { Application } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
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
connectDB().then(() => {
  seedPolicies();
});

// Permite todas las conexiones temporalmente para pruebas
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev')); 
app.use(express.json()); 

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrows', borrowRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', report);
app.use('/api/policies', policyRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT} y accesible en toda la red local`);
});

export default app;