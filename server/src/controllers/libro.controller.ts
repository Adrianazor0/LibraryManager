import { Request, Response } from 'express';
import Libro from '../models/Libro';

export const registrarLibro = async (req: Request, res: Response) => {
    try {
        const nuevoLibro = new Libro(req.body);
        await nuevoLibro.save();
        res.status(201).json({ msg: "Libro registrado exitosamente", nuevoLibro });
    } catch (error) {
        res.status(500).json({ msg: "Error en el servidor", error });
    }
};

export const obtenerCatalogo = async (req: Request, res: Response) => {
    const libros = await Libro.find({ stockDisponible: { $gt: 0 } });
    res.json(libros);
};