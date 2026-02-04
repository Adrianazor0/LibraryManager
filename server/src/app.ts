import express, { Application } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import bookRoutes from './routes/book.routes';
import borrowRoutes from './routes/borrow.routes';

dotenv.config();
const app: Application = express();
connectDB();

app.use(cors()); 
app.use(morgan('dev')); 
app.use(express.json()); 

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrows', borrowRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});

export default app;