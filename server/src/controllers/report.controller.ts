import { Request, Response } from 'express';
import Borrow from '../models/Borrow';
import Book from '../models/Book';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 1. Libros más pedidos (Top 5)
    const topBooks = await Borrow.aggregate([
      { $group: { _id: "$bookId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'bookDetails' } },
      { $unwind: "$bookDetails" },
      { $project: { title: "$bookDetails.title", count: 1 } }
    ]);

    // 2. Conteo de préstamos por estado
    const borrowStatus = await Borrow.aggregate([
      { $group: { _id: "$status", total: { $sum: 1 } } }
    ]);

    // 3. Resumen general
    const totalBooks = await Book.countDocuments();
    const activeLoans = await Borrow.countDocuments({ status: 'prestado' });
    const overdueBooks = await Borrow.countDocuments({ 
      status: { $in: ['prestado', 'atrasado'] }, 
      dueDate: { $lt: new Date() } 
    });

    res.json({
      topBooks,
      borrowStatus,
      summary: {
        totalBooks,
        activeLoans,
        overdueBooks
      }
    });
  } catch (error) {
    res.status(500).json({ msg: "Error al generar reportes" });
  }
};