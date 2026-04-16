import { Request, Response } from 'express';
import LibraryPolicy from '../models/LibraryPolicy';

export const getPolicies = async (req: Request, res: Response) => {
    try {
        const policies = await LibraryPolicy.find();
        res.json(policies);
    } catch (error: any) {
        res.status(500).json({ msg: "Error al obtener políticas", error: error.message });
    }
};

export const updatePolicy = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedPolicy = await LibraryPolicy.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedPolicy) return res.status(404).json({ msg: "Política no encontrada" });
        
        res.json({ msg: "Política actualizada correctamente", updatedPolicy });
    } catch (error: any) {
        res.status(500).json({ msg: "Error al actualizar política", error: error.message });
    }
};

export const createPolicy = async (req: Request, res: Response) => {
    try {
        const { section } = req.body;
        
        // Verificar si ya existe
        const existing = await LibraryPolicy.findOne({ section });
        if (existing) {
            return res.status(400).json({ msg: "Esta sección ya existe" });
        }

        // Crear con reglas por defecto si no se envían
        const newPolicy = new LibraryPolicy({
            section,
            canBorrow: req.body.canBorrow ?? true,
            rules: req.body.rules || [
                { role: 'estudiante', maxBooks: 1, loanDays: 1 },
                { role: 'docente', maxBooks: 1, loanDays: 1 },
                { role: 'bibliotecario', maxBooks: 1, loanDays: 1 },
                { role: 'admin', maxBooks: 1, loanDays: 1 }
            ]
        });

        await newPolicy.save();
        res.status(201).json(newPolicy);
    } catch (error: any) {
        res.status(500).json({ msg: "Error al crear la sección", error: error.message });
    }
};
