import { Request, Response } from 'express';
import Book from '../models/Book';

export const registerBook = async (req: Request, res: Response) => {
    try {
        const newBook = new Book(req.body);
        await newBook.save();
        res.status(201).json({ msg: "Libro registrado exitosamente", newBook });
    } catch (error) {
        res.status(500).json({ msg: "Error en el servidor", error });
    }
};

export const getCatalog = async (req: Request, res: Response) => {
    const books = await Book.find({ stockAvailable: { $gt: 0 } });
    res.json(books);
};