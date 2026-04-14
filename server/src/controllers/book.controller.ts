import { Request, Response } from 'express';
import Book from '../models/Book';
import { logActivity } from '../utils/Logger';

// Definimos la extensión del tipo Request para incluir el usuario de la sesión
interface AuthRequest extends Request {
    user?: {
        _id: string;
        name?: string;
        role?: string;
    }
}

export const createBook = async (req: AuthRequest, res: Response) => { // <-- Cambiado a AuthRequest
    try {
        const bookData = req.body;

        const existingBook = await Book.findOne({ isbn: bookData.isbn });
        if (existingBook) {
            return res.status(400).json({ msg: "El ISBN ya está registrado en el sistema." });
        }

        const newBook = new Book({
            ...bookData,
            stockAvailable: bookData.stockTotal
        });

        await newBook.save();

        // Usamos ?. para evitar errores si req.user llegara a estar vacío
        await logActivity(
            'ALTA_LIBRO',
            req.user?._id || 'SYSTEM', 
            newBook._id.toString(),
            `Libro "${newBook.title}" añadido al inventario con stock ${newBook.stockTotal}`
        );

        res.status(201).json(newBook);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ msg: "Error al registrar el libro", error: error.message });
    }
};

export const updateBook = async (req: AuthRequest, res: Response) => { // <-- Cambiado a AuthRequest
    try {
        const { id } = req.params;
        const updateData = req.body;

        delete updateData._id;

        const updatedBook = await Book.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedBook) {
            return res.status(404).json({ msg: "El libro que intentas editar ya no existe." });
        }

        await logActivity(
            'EDICION_LIBRO',
            req.user?._id || 'SYSTEM',
            updatedBook._id.toString(),
            `Libro "${updatedBook.title}" actualizado en el inventario`
        );

        res.json(updatedBook);
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({
                msg: "Error: El ISBN o Código de Barras ya pertenece a otro libro."
            });
        }

        res.status(500).json({
            msg: "Error interno al actualizar",
            error: error.message
        });
    }
};

export const getAllBooks = async (req: Request, res: Response) => {
    try {
        const books = await Book.find()
            .select('title author isbn category stockAvailable stockTotal location.shelf location.level location.callNumber description barcode yearPublish publisher section')
            .sort({ title: 1 });

        res.json(books);
    } catch (error: any) {
        res.status(500).json({ msg: "Error al obtener el catálogo", error: error.message });
    }
};

export const getBookById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id);

        if (!book) return res.status(404).json({ msg: "Libro no encontrado" });

        res.json(book);
    } catch (error: any) {
        res.status(500).json({ msg: "Error al buscar el detalle del libro" });
    }
};

export const deleteBook = async (req: AuthRequest, res: Response) => { // <-- También lo puse como AuthRequest por si quieres loguear quién borra
    try {
        const { id } = req.params;

        const book = await Book.findById(id);
        if (!book) return res.status(404).json({ msg: "El libro no existe" });

        if (book.stockAvailable < book.stockTotal) {
            return res.status(400).json({
                msg: "No se puede eliminar: Este libro tiene préstamos activos pendientes de devolución."
            });
        }

        await Book.findByIdAndDelete(id);

        // Opcional: Loguear la eliminación
        await logActivity(
            'BAJA_LIBRO',
            req.user?._id || 'SYSTEM',
            book._id.toString(),
            `Libro "${book.title}" eliminado permanentemente del sistema`
        );

        res.json({ msg: "Libro eliminado del inventario correctamente" });
    } catch (error: any) {
        res.status(500).json({ msg: "Error al eliminar el libro", error: error.message });
    }
};