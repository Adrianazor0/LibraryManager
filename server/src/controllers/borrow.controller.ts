import { Request, Response } from 'express';
import Borrow from '../models/Borrow';
import Book from '../models/Book';
import User from '../models/User';
import LibraryPolicy from '../models/LibraryPolicy';
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

        // Obtener política dinámica
        const policy = await LibraryPolicy.findOne({ section: book.section });
        if (!policy) return res.status(500).json({ msg: "Política de sección no definida" });

        if (!policy.canBorrow) {
            return res.status(403).json({ msg: `Los libros de la sección "${book.section}" no están permitidos para préstamo físico.` });
        }

        const roleRule = policy.rules.find((r: any) => r.role === user.role);
        if (!roleRule) return res.status(403).json({ msg: `El rol ${user.role} no tiene reglas definidas para esta sección.` });

        if (book.stockAvailable <= 0) {
            return res.status(400).json({ msg: "No hay ejemplares disponibles" });
        }

        const activeLoans = await Borrow.countDocuments({ 
            userId: user._id, 
            $or: [
                { status: 'atrasado' },
                { status: 'prestado' } // Incluimos todos los prestados, ya que cuentan para el límite
            ]
        });

        if (activeLoans >= roleRule.maxBooks) {
            return res.status(400).json({
                msg: `Límite excedido. Como ${user.role} solo puedes tener ${roleRule.maxBooks} libros activos de esta sección.`
            });
        }

        // Validación de fecha no pasada
        const departureDate = req.body.startDate ? new Date(req.body.startDate + 'T00:00:00') : new Date();
        departureDate.setHours(0, 0, 0, 0);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (departureDate < today) {
            return res.status(400).json({ msg: "No puedes registrar un préstamo con una fecha de inicio en el pasado." });
        }

        const dueDate = new Date(departureDate);
        dueDate.setDate(dueDate.getDate() + roleRule.loanDays);

        const newBorrow = new Borrow({
            bookId: book._id,
            userId: user._id,
            approvedBy: (req as any).user?.id, // Guardar quién lo registró
            departureDate: departureDate,
            dueDate: dueDate,
            status: 'prestado' 
        });

        book.stockAvailable -= 1;
        await Promise.all([newBorrow.save(), book.save()]);

        await logActivity(
            'PRESTAMO',
            req.user?._id || userId, 
            bookId,
            `Préstamo directo de ${book.section} a ${user.name} para devolver el ${dueDate.toLocaleDateString()}`
        );

        res.status(201).json({
            msg: "Préstamo registrado exitosamente",
            newBorrow,
            details: { returnDate: dueDate.toLocaleDateString(), roleApplied: user.role }
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
        .sort({ departureDate: 1 }) // Ordenados por fecha de inicio
        .lean();

        // Mapeo dinámico para que el dashboard vea el estado real de atraso
        const processedBorrows = borrows.map(item => {
            if (item.status === 'prestado' && new Date() > new Date(item.dueDate)) {
                return { ...item, status: 'atrasado' };
            }
            return item;
        });

        res.json(processedBorrows);
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
        const { startDate, endDate, status } = req.query;
        const query: any = {};
        const today = new Date();

        // Si el usuario pide 'atrasado', debemos buscar los que ya tienen ese status 
        // O los que son 'prestado' pero ya vencieron
        if (status === 'atrasado') {
            query.$or = [
                { status: 'atrasado' },
                { status: 'prestado', dueDate: { $lt: today } }
            ];
        } else if (status) {
            query.status = status;
        }

        if (startDate || endDate) {
            query.departureDate = {};
            if (startDate) query.departureDate.$gte = new Date(startDate as string + 'T00:00:00');
            if (endDate) query.departureDate.$lte = new Date(endDate as string + 'T23:59:59');
        }

        const history = await Borrow.find(query)
            .populate('bookId', 'title author isbn section')
            .populate('userId', 'name lastname enrollmentId role')
            .populate('approvedBy', 'name lastname role')
            .sort({ departureDate: -1 })
            .lean();

        // Mapear para detectar estados atrasados dinámicamente en la respuesta
        const processedHistory = history.map(item => {
            if (item.status === 'prestado' && today > new Date(item.dueDate)) {
                return { ...item, status: 'atrasado' };
            }
            return item;
        });

        res.json(processedHistory);
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener el historial" });
    }
};

export const requestBorrow = async (req: Request, res: Response) => {
    try {
        const { bookId, daysBorrowed, startDate } = req.body;
        const userId = (req as any).user.id;
        const userRole = (req as any).user.role;

        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ msg: "Libro no encontrado" });

        // Obtener política dinámica
        const policy = await LibraryPolicy.findOne({ section: book.section });
        if (!policy) return res.status(500).json({ msg: "Política de sección no definida" });

        if (!policy.canBorrow) {
            return res.status(403).json({ msg: `Los libros de la sección "${book.section}" solo pueden consultarse en sala.` });
        }

        const roleRule = policy.rules.find((r: any) => r.role === userRole);
        if (!roleRule) return res.status(403).json({ msg: `Tu rol no tiene permisos para solicitar libros de esta sección.` });

        const requestedDays = Number(daysBorrowed);
        if (requestedDays > roleRule.loanDays) {
            return res.status(400).json({ 
                msg: `El tiempo máximo permitido para esta sección es de ${roleRule.loanDays} días. Tu solicitud de ${requestedDays} excede el límite.` 
            });
        }

        // Validar límite de libros activos
        const activeLoans = await Borrow.countDocuments({ 
            userId, 
            status: { $in: ['pendiente', 'prestado', 'atrasado'] } 
        });

        if (activeLoans >= roleRule.maxBooks) {
            return res.status(400).json({
                msg: `Ya tienes ${activeLoans} solicitudes o préstamos activos. El límite para tu rol es de ${roleRule.maxBooks}.`
            });
        }

        const departureDate = startDate ? new Date(startDate + 'T00:00:00') : new Date();
        departureDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (departureDate < today) {
            return res.status(400).json({ msg: "No puedes solicitar un préstamo para una fecha pasada." });
        }

        const dueDate = new Date(departureDate);
        dueDate.setDate(dueDate.getDate() + requestedDays);

        const newBorrow = new Borrow({
            bookId,
            userId,
            departureDate,
            dueDate,
            status: 'pendiente'
        });

        await newBorrow.save();
        
        await logActivity(
            'PETICION DE PRESTAMO',
            userId,
            bookId,
            `Solicitud de ${book.section} para el ${departureDate.toLocaleDateString()} por ${requestedDays} días.`
        );

        res.status(201).json({ msg: "Solicitud enviada con éxito", newBorrow });
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

        const borrow = await Borrow.findById(id).populate('bookId').populate('userId');
        if (!borrow) return res.status(404).json({ msg: "Solicitud no encontrada" });
        
        const book = borrow.bookId as any;
        const user = borrow.userId as any;

        if (!book || book.stockAvailable <= 0) {
            return res.status(400).json({ msg: "No hay stock disponible" });
        }

        // Validación: Fecha de devolución no puede ser antes de la fecha de inicio
        if (dueDate) {
            const requestedDate = new Date(dueDate);
            const startDate = borrow.departureDate ? new Date(borrow.departureDate) : new Date();
            startDate.setHours(0, 0, 0, 0);
            
            if (requestedDate < startDate) {
                return res.status(400).json({ msg: "La fecha de devolución no puede ser anterior a la fecha de inicio del préstamo." });
            }
        }

        // Lógica de restricción de fechas para Bibliotecarios
        if (req.user?.role === 'bibliotecario' && dueDate) {
            const policy = await LibraryPolicy.findOne({ section: book.section });
            const roleRule = policy?.rules.find(r => r.role === user.role);
            
            if (roleRule) {
                const requestedDate = new Date(dueDate);
                const startDate = borrow.departureDate ? new Date(borrow.departureDate) : new Date();
                
                // Calcular diferencia en días
                const diffTime = Math.abs(requestedDate.getTime() - startDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays > roleRule.loanDays) {
                    return res.status(403).json({ 
                        msg: `Como Bibliotecario no puedes exceder el límite de ${roleRule.loanDays} días para este usuario. Solo un Administrador puede autorizar extensiones especiales.` 
                    });
                }
            }
        }

        borrow.status = 'prestado';
        if (dueDate) borrow.dueDate = new Date(dueDate);
        borrow.approvedBy = (req as any).user?.id;
        book.stockAvailable -= 1;

        await Promise.all([borrow.save(), book.save()]);

        await logActivity(
            'APROBACION_PRESTAMO',
            req.user?._id || 'SYSTEM',
            book._id.toString(),
            `Solicitud aprobada por ${req.user?.role}. Fecha entrega: ${borrow.dueDate.toLocaleDateString()}`
        );

        res.json({ msg: "Préstamo aprobado", borrow });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al aprobar el préstamo" });
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

export const getPendingRequests = async (req: Request, res: Response) => {
    try {
        const borrows = await Borrow.find({ status: 'pendiente' })
            .populate('bookId', 'title isbn section')
            .populate('userId', 'name lastname enrollmentId role')
            .sort({ departureDate: 1 }); // Ordenar por fecha de inicio solicitada

        res.status(200).json(borrows);
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener solicitudes" });
    }
};