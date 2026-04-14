import { Request, Response } from 'express';
import Borrow from '../models/Borrow';
import Book from '../models/Book';
import User from '../models/User';
import { logActivity } from '../utils/Logger';

// Extensión de la interfaz para reconocer al usuario autenticado
interface AuthRequest extends Request {
    user?: {
        id: string;
        _id: string;
        name?: string;
        role?: string;
    }
}

export const createBorrow = async (req: AuthRequest, res: Response) => {
    try {
        const { userId, bookId } = req.body;
        const [user, book] = await Promise.all([
            User.findById(userId),
            Book.findById(bookId)
        ]);

        if (!user || !book) {
            return res.status(404).json({ msg: "Usuario o Libro no encontrado" });
        }

        const loanRules = {
            docente: { maxBooks: 10, days: 30 },
            estudiante: { maxBooks: 3, days: 7 },
            administrativo: { maxBooks: 5, days: 15 }
        };

        const userRole = user.role as keyof typeof loanRules;
        const currentRules = loanRules[userRole] || loanRules.estudiante;

        if (book.stockAvailable <= 0) {
            return res.status(400).json({ msg: "No hay ejemplares disponibles" });
        }

        const activeLoans = await Borrow.countDocuments({ 
            userId: user._id, 
            status: { $in: ['prestado', 'atrasado'] } 
        });

        if (activeLoans >= currentRules.maxBooks) {
            return res.status(400).json({
                msg: `Límite excedido. Como ${userRole} solo puedes tener ${currentRules.maxBooks} libros activos.`
            });
        }

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + currentRules.days);

        const newBorrow = new Borrow({
            bookId: book._id,
            userId: user._id,
            dueDate: dueDate,
            status: 'prestado' 
        });

        book.stockAvailable -= 1;
        await Promise.all([newBorrow.save(), book.save()]);

        // ✅ CORRECCIÓN: Usamos ?. y toString()
        await logActivity(
            'PRESTAMO',
            req.user?._id || userId, 
            bookId,
            `Préstamo directo a ${user.name} para devolver el ${dueDate.toLocaleDateString()}`
        );

        res.status(201).json({
            msg: "Préstamo registrado exitosamente",
            newBorrow,
            details: { returnDate: dueDate.toLocaleDateString(), roleApplied: userRole }
        });
    } catch (error: any) {
        res.status(500).json({ msg: error.message });
    }
};

export const getActiveBorrows = async (req: Request, res: Response) => {
    try {
        // ✅ Filtro estricto: Solo libros entregados (prestado) 
        // o libros que ya se pasaron de fecha (atrasado)
        const borrows = await Borrow.find({ 
            status: { $in: ['prestado', 'atrasado'] } 
        })
        .populate('bookId')
        .populate('userId')
        .sort({ dueDate: 1 }) // Opcional: Los que vencen pronto primero
        .lean();

        res.json(borrows);
    } catch (error: any) {
        res.status(500).json({ msg: "Error al obtener préstamos activos" });
    }
};

// En borrowController.ts
export const returnBook = async (req: AuthRequest, res: Response) => {
    try {
        // 1. Forzamos a que id sea tratado como string
        const id = req.params.id as string; 

        const borrow = await Borrow.findById(id).populate('bookId');
        if (!borrow) return res.status(404).json({ msg: "Préstamo no encontrado" });
        if (borrow.status === 'devuelto') return res.status(400).json({ msg: "Este libro ya fue devuelto" });

        borrow.status = 'devuelto';
        await borrow.save();

        // 2. Usamos una validación más limpia para el logActivity
        await logActivity(
            'DEVOLUCION',
            req.user?._id || borrow.userId?.toString() || 'SYSTEM',
            borrow.bookId?._id?.toString() || id, // Aquí id ya es seguro como string
            `Libro devuelto. Fecha compromiso era: ${borrow.dueDate.toLocaleDateString()}`
        );

        await Book.findByIdAndUpdate(borrow.bookId, {
            $inc: { stockAvailable: 1 }
        });

        res.json({ msg: "Libro devuelto exitosamente y stock actualizado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al procesar devolución" });
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

export const requestBorrow = async (req: Request, res: Response) => {
    try {
        const { bookId, daysBorrowed } = req.body;
        const userId = (req as any).user.id;

        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ msg: "Libro no encontrado" });

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (Number(daysBorrowed) || 7));

        const newBorrow = new Borrow({
            bookId,
            userId,
            dueDate,
            status: 'pendiente' // <--- ASEGÚRATE QUE SEA 'pendiente'
        });

        // IMPORTANTE: AQUÍ NO DEBE HABER "book.stockAvailable -= 1"
        // NI TAMPOCO "book.save()"

        await newBorrow.save();
        await logActivity(
            'PETICION DE PRESTAMO',
            userId,
            bookId,
            `Préstamo registrado para devolver el ${dueDate.toLocaleDateString()}`
        );
        res.status(201).json({ msg: "Solicitud enviada", newBorrow });
    } catch (error: any) {
        res.status(500).json({ msg: error.message });
    }
};

export const getMyBorrows = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id || (req as any).user._id;

        const myBorrows = await Borrow.find({ userId })
            .populate('bookId', 'title author') // Traemos datos del libro
            .sort({ createdAt: -1 }); // Los más recientes primero

        res.status(200).json(myBorrows);
    } catch (error: any) {
        res.status(500).json({ msg: "Error al obtener tus préstamos", error: error.message });
    }
};

export const approveBorrow = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { dueDate } = req.body;

        const borrow = await Borrow.findById(id);
        if (!borrow) return res.status(404).json({ msg: "Solicitud no encontrada" });
        
        const book = await Book.findById(borrow.bookId);
        if (!book || book.stockAvailable <= 0) {
            return res.status(400).json({ msg: "No hay stock disponible" });
        }

        borrow.status = 'prestado';
        if (dueDate) borrow.dueDate = new Date(dueDate);
        book.stockAvailable -= 1;

        await Promise.all([borrow.save(), book.save()]);

        // ✅ CORRECCIÓN: toString() para asegurar que pasamos un string al logger
        await logActivity(
            'APROBACION_PRESTAMO',
            req.user?._id || 'SYSTEM',
            borrow.bookId.toString(),
            `Solicitud aprobada por administrador`
        );

        res.json({ msg: "Préstamo aprobado", borrow });
    } catch (error) {
        res.status(500).json({ msg: "Error al aprobar" });
    }
};

// Eliminar/Rechazar solicitud
export const rejectBorrow = async (req: Request, res: Response) => {
    try {
        await Borrow.findByIdAndDelete(req.params.id);
        res.json({ msg: "Solicitud rechazada y eliminada" });
    } catch (error) {
        res.status(500).json({ msg: "Error al rechazar" });
    }
};

// ESTO VA EN EL BACKEND (borrow.controller.ts)
export const getPendingRequests = async (req: Request, res: Response) => {
    try {
        const borrows = await Borrow.find({ status: 'pendiente' })
            .populate('bookId', 'title isbn')
            .populate('userId', 'name lastname enrollmentId');

        res.status(200).json(borrows);
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener solicitudes" });
    }
};