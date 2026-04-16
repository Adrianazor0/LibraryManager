import { Request, Response } from 'express';
import Book from '../models/Book';
import User from '../models/User';
import Borrow from '../models/Borrow';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();

    const [totalBooks, totalUsers, activeBorrows, overdueBooks, recentBorrows] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ status: { $ne: 'eliminado' } }),
      // Activos son los que están en posesión (prestado) o ya vencidos (atrasado)
      Borrow.countDocuments({ status: { $in: ['prestado', 'atrasado'] } }), 
      // Vencidos son los que tienen status 'atrasado' O los 'prestado' cuya fecha ya pasó
      Borrow.countDocuments({ 
        $or: [
            { status: 'atrasado' },
            { status: 'prestado', dueDate: { $lt: today } }
        ]
      }),

      Borrow.find({ status: { $ne: 'pendiente' } })
        .sort({ updatedAt: -1 }) 
        .limit(5)
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
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ msg: "Error al generar KPIs" });
  }
};