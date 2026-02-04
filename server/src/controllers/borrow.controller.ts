import { Request, Response } from 'express';
import Borrow from '../models/Borrow'; 
import Book from '../models/Book';

export const createBorrow = async (req: Request, res: Response) => {
    const { bookId, userId, daysBorrowed } = req.body;

    try {
        const book = await Book.findById(bookId);
        if (!book || book.stockAvailable <= 0) {
            return res.status(400).json({ msg: "Libro no disponible para préstamo" });
        }

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (daysBorrowed || 7));

        const newBorrow = new Borrow({
            bookId,
            userId,
            dueDate: dueDate,
            status: 'pendiente'
        });

        book.stockAvailable -= 1;
        
        await Promise.all([newBorrow.save(), book.save()]);

        res.status(201).json({ msg: "Préstamo registrado", newBorrow });
    } catch (error) {
        res.status(500).json({ msg: "Error al procesar el préstamo" });
    }
};

export const returnBorrow = async (req: Request, res: Response) => {
    const { borrowId } = req.params;

    try {
        const borrow = await Borrow.findById(borrowId);
        
        if (!borrow) {
            return res.status(404).json({ msg: "Préstamo no encontrado" });
        }

        if (borrow.status === 'devuelto') {
            return res.status(400).json({ msg: "Este libro ya fue devuelto anteriormente" });
        }

        borrow.status = 'devuelto';

        const book = await Book.findById(borrow.bookId);
        if (book) {
            book.stockAvailable += 1;
            await book.save();
        }

        await borrow.save();

        res.json({ 
            msg: "Libro devuelto exitosamente e inventario actualizado", 
            borrow 
        });

    } catch (error) {
        res.status(500).json({ msg: "Error al procesar la devolución", error });
    }
};

export const getBorrowsHistory = async (req: Request, res: Response) => {
    try {
        const history = await Borrow.find()
            .populate('bookId', 'titulo autor isbn') 
            .populate('userId', 'nombre apellido matricula')
            .sort({ createdAt: -1 });

        res.json(history);
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener el historial" });
    }
};