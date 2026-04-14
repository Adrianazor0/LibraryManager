import { Request, Response } from 'express';
import Book from '../models/Book';
import User from '../models/User';
import Borrow from '../models/Borrow';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [totalBooks, totalUsers, activeBorrows, overdueBooks, recentBorrows] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments(),
      Borrow.countDocuments({ status: 'pendiente' }), 
      Borrow.countDocuments({ 
        status: 'pendiente', 
        dueDate: { $lt: new Date() } // Asegúrate que el campo sea dueDate o fechaDevolucion según tu modelo
      }),
      
      // CAMBIO AQUÍ: Ordenamos por updatedAt para captar devoluciones recientes
      Borrow.find()
        .sort({ updatedAt: -1 }) 
        .limit(3) // Te sugiero subirlo a 5 para que se vea más lleno, pero puedes dejarlo en 3
        .populate('bookId', 'title')
        .populate('userId', 'name lastname')
    ]);

    res.json({
      totalBooks,
      registeredUsers: totalUsers,
      activeBorrows,
      overdueBooks,
      recentBorrows
    });
  } catch (error) {
    console.error(error); // Siempre es bueno loguear el error real en consola
    res.status(500).json({ msg: "Error al generar KPIs" });
  }
};