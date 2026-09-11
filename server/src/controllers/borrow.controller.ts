import { Request, Response } from 'express';
import Borrow from '../models/Borrow';
import Book from '../models/Book';
import User from '../models/User';
import LibraryPolicy from '../models/LibraryPolicy';
import { logActivity } from '../utils/Logger';
import { getIO } from '../socket';

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

        // --- CORRECCIÓN DE FECHAS ---
        // Si viene YYYY-MM-DD, lo parseamos manualmente para evitar desfases de zona horaria
        let departureDate: Date;
        if (req.body.startDate) {
            const [y, m, d] = req.body.startDate.split('-').map(Number);
            departureDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0)); 
        } else {
            departureDate = new Date();
            departureDate.setUTCHours(0, 0, 0, 0);
        }
        
        // 'today' para validación en UTC
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        if (departureDate < today) {
            return res.status(400).json({ msg: "No puedes registrar un préstamo con una fecha de inicio en el pasado." });
        }

        const dueDate = new Date(departureDate);
        dueDate.setUTCDate(dueDate.getUTCDate() + roleRule.loanDays);

        const newBorrow = new Borrow({
            bookId: book._id,
            userId: user._id,
            approvedBy: (req as any).user?.id, 
            departureDate: departureDate,
            dueDate: dueDate,
            status: 'prestado' 
        });

        book.stockAvailable -= 1;
        await Promise.all([newBorrow.save(), book.save()]);

        await logActivity(
            'PRESTAMO',
            req.user?.id || req.user?._id || userId, 
            bookId,
            `Préstamo directo de ${book.section} a ${user.name} para devolver el ${dueDate.toISOString().split('T')[0]}`
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
        const today = new Date();
        const processedBorrows = borrows.map(item => {
            if (item.status === 'prestado' && today > new Date(item.dueDate)) {
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
            req.user?.id || req.user?._id || borrow.userId?.toString() || 'SYSTEM',
            borrow.bookId?._id?.toString() || id, // Aquí id ya es seguro como string
            `Libro devuelto. Fecha compromiso era: ${borrow.dueDate.toISOString().split('T')[0]}`
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
            if (startDate) query.departureDate.$gte = new Date(startDate as string + 'T00:00:00.000Z');
            if (endDate) query.departureDate.$lte = new Date(endDate as string + 'T23:59:59.999Z');
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

        // --- CORRECCIÓN DE FECHAS ---
        let departureDate: Date;
        if (startDate) {
            const [y, m, d] = startDate.split('-').map(Number);
            departureDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0)); 
        } else {
            departureDate = new Date();
            departureDate.setUTCHours(0, 0, 0, 0);
        }

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        if (departureDate < today) {
            return res.status(400).json({ msg: "No puedes solicitar un préstamo para una fecha pasada." });
        }

        const dueDate = new Date(departureDate);
        dueDate.setUTCDate(dueDate.getUTCDate() + requestedDays);

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
            `Solicitud de ${book.section} para el ${departureDate.toISOString().split('T')[0]} por ${requestedDays} días.`
        );

        // Notificación en tiempo real a la Web (Bibliotecarios/Admins)
        try {
            const requestingUser = await User.findById(userId).select('name lastname enrollmentId');
            const io = getIO();
            if (io) {
                io.to('admin_room').emit('new_borrow_request', {
                    id: newBorrow._id,
                    userName: requestingUser ? `${requestingUser.name} ${requestingUser.lastname}` : 'Estudiante',
                    enrollmentId: requestingUser?.enrollmentId,
                    bookTitle: book.title,
                    author: book.author,
                    requestedDays,
                    createdAt: new Date().toISOString(),
                    msg: `¡Nueva solicitud de préstamo de "${book.title}"!`
                });
            }
        } catch (socketErr) {
            console.error("Error al emitir socket de préstamo:", socketErr);
        }

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

        // --- CORRECCIÓN DE FECHAS EN APROBACIÓN ---
        if (dueDate) {
            // Manejar tanto YYYY-MM-DD como ISO strings
            const datePart = dueDate.split('T')[0];
            const [y, m, d] = datePart.split('-').map(Number);
            const requestedDate = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999)); // Fin del día UTC
            
            const startDate = borrow.departureDate ? new Date(borrow.departureDate) : new Date();
            startDate.setUTCHours(0, 0, 0, 0);
            
            if (requestedDate < startDate) {
                return res.status(400).json({ msg: "La fecha de devolución no puede ser anterior a la fecha de inicio del préstamo." });
            }
            
            borrow.dueDate = requestedDate;
        }

        // Lógica de restricción de fechas para Bibliotecarios
        if (req.user?.role === 'bibliotecario' && dueDate) {
            const policy = await LibraryPolicy.findOne({ section: book.section });
            const roleRule = policy?.rules.find(r => r.role === user.role);
            
            if (roleRule) {
                const datePart = dueDate.split('T')[0];
                const [y, m, d] = datePart.split('-').map(Number);
                const requestedDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
                
                const startDate = borrow.departureDate ? new Date(borrow.departureDate) : new Date();
                startDate.setUTCHours(0, 0, 0, 0);
                
                // Calcular diferencia en días (en UTC)
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
        borrow.approvedBy = (req as any).user?.id;
        book.stockAvailable -= 1;

        await Promise.all([borrow.save(), book.save()]);

        await logActivity(
            'APROBACION_PRESTAMO',
            req.user?.id || req.user?._id || 'SYSTEM',
            book._id.toString(),
            `Solicitud aprobada por ${req.user?.role}. Fecha entrega: ${borrow.dueDate.toISOString().split('T')[0]}`
        );

        // Notificación en tiempo real a la App Móvil del estudiante
        try {
            const targetUserId = user._id ? user._id.toString() : user.toString();
            const io = getIO();
            if (io) {
                io.to(`user_${targetUserId}`).emit('borrow_status_updated', {
                    id: borrow._id,
                    status: 'prestado',
                    bookTitle: book.title,
                    dueDate: borrow.dueDate,
                    msg: `¡Tu solicitud para "${book.title}" ha sido APROBADA!`
                });
                io.to('admin_room').emit('borrow_request_handled', { id: borrow._id, status: 'prestado' });
            }
        } catch (socketErr) {
            console.error("Error al emitir socket de aprobación:", socketErr);
        }

        res.json({ msg: "Préstamo aprobado", borrow });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al aprobar el préstamo" });
    }
};

// Eliminar/Rechazar solicitud
export const rejectBorrow = async (req: Request, res: Response) => {
    try {
        const borrow = await Borrow.findById(req.params.id).populate('bookId', 'title');
        if (borrow) {
            const targetUserId = borrow.userId ? borrow.userId.toString() : '';
            const bookTitle = (borrow.bookId as any)?.title || 'Libro';

            await Borrow.findByIdAndDelete(req.params.id);

            try {
                const io = getIO();
                if (io && targetUserId) {
                    io.to(`user_${targetUserId}`).emit('borrow_status_updated', {
                        id: req.params.id,
                        status: 'rechazado',
                        bookTitle,
                        msg: `Tu solicitud de préstamo para "${bookTitle}" fue rechazada.`
                    });
                    io.to('admin_room').emit('borrow_request_handled', { id: req.params.id, status: 'rechazado' });
                }
            } catch (socketErr) {
                console.error("Error al emitir socket de rechazo:", socketErr);
            }
        } else {
            await Borrow.findByIdAndDelete(req.params.id);
        }

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

/**
 * Controller for Phase 5: Predictive Inventory Analytics & Turnover Rates
 * GET /api/borrows/analytics
 */
export const getBorrowAnalytics = async (req: Request, res: Response) => {
    try {
        const [allBooks, activeBorrows, historyBorrows] = await Promise.all([
            Book.find({}).lean(),
            Borrow.find({ status: { $in: ['prestado', 'atrasado', 'pendiente'] } }).populate('bookId', 'title category section stockAvailable stockTotal').populate('userId', 'name enrollmentId').lean(),
            Borrow.find({ status: 'devuelto' }).populate('bookId', 'title category').lean()
        ]);

        const totalBooksCount = allBooks.reduce((acc, b) => acc + (b.stockTotal || 1), 0);
        const availableBooksCount = allBooks.reduce((acc, b) => acc + (b.stockAvailable || 0), 0);
        const activeLoansCount = activeBorrows.filter(b => b.status === 'prestado').length;
        const overdueLoansCount = activeBorrows.filter(b => b.status === 'atrasado').length;
        const pendingCount = activeBorrows.filter(b => b.status === 'pendiente').length;
        const returnedOnTimeCount = historyBorrows.length;

        const totalTransactions = returnedOnTimeCount + overdueLoansCount + activeLoansCount;
        const onTimeReturnRate = totalTransactions > 0 ? Math.round((returnedOnTimeCount / (returnedOnTimeCount + overdueLoansCount || 1)) * 100) : 98;

        const turnoverRate = totalBooksCount > 0 ? parseFloat(((totalTransactions / totalBooksCount) * 100).toFixed(1)) : 14.5;
        const healthIndex = Math.max(80, 100 - (overdueLoansCount * 2));

        const bookDemandMap: Record<string, { title: string; count: number; section: string; available: number }> = {};

        [...activeBorrows, ...historyBorrows].forEach((borrow: any) => {
            if (borrow.bookId && borrow.bookId.title) {
                const title = borrow.bookId.title;
                if (!bookDemandMap[title]) {
                    bookDemandMap[title] = {
                        title,
                        count: 0,
                        section: borrow.bookId.section || 'General',
                        available: borrow.bookId.stockAvailable ?? 3
                    };
                }
                bookDemandMap[title].count += 1;
            }
        });

        const topDemandedBooks = Object.values(bookDemandMap)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const predictedDeficitBooks = allBooks
            .filter(b => (b.stockAvailable || 0) <= 2)
            .map(b => ({
                title: b.title,
                author: b.author,
                stockAvailable: b.stockAvailable,
                stockTotal: b.stockTotal,
                riskLevel: b.stockAvailable === 0 ? 'CRÍTICO' : 'ALTO',
                recommendation: `Reabastecer +${Math.max(3, b.stockTotal)} ejemplares pre-exámenes`
            }))
            .slice(0, 5);

        res.json({
            success: true,
            summary: {
                totalBooksCount,
                availableBooksCount,
                activeLoansCount,
                overdueLoansCount,
                pendingCount,
                onTimeReturnRate,
                turnoverRate,
                healthIndex
            },
            topDemandedBooks,
            predictedDeficitBooks,
            recentActiveLoans: activeBorrows.slice(0, 8)
        });
    } catch (error: any) {
        console.error("Error en Analítica de Inventario:", error);
        res.status(500).json({ msg: "Error al generar métricas predictivas de inventario", error: error.message });
    }
};

/**
 * Quick 1-Tap Loan Renewal Endpoint for Mobile APK & Web
 * PUT /api/borrows/renew/:id
 */
export const renewBorrow = async (req: Request, res: Response) => {
    try {
        const borrowId = req.params.id;
        const userId = (req as any).user?.id || (req as any).user?._id;

        const borrow = await Borrow.findById(borrowId).populate('bookId');
        if (!borrow) return res.status(404).json({ msg: "Registro de préstamo no encontrado" });

        const currentDue = new Date(borrow.dueDate || new Date());
        currentDue.setDate(currentDue.getDate() + 7);

        borrow.dueDate = currentDue;
        borrow.status = 'prestado';
        await borrow.save();

        await logActivity(
            'RENOVACION_PRESTAMO',
            userId || 'SYSTEM',
            borrow.bookId?._id?.toString() || borrow._id.toString(),
            `Renovación exitosa de préstamo por 7 días adicionales. Nueva fecha de vencimiento: ${currentDue.toISOString().split('T')[0]}`
        );

        res.json({
            success: true,
            msg: `¡Préstamo renovado exitosamente por 7 días adicionales! Nueva fecha límite: ${currentDue.toLocaleDateString('es-DO')}`,
            borrow
        });
    } catch (error: any) {
        console.error("Error al renovar préstamo:", error);
        res.status(500).json({ msg: "Error al renovar préstamo", error: error.message });
    }
};