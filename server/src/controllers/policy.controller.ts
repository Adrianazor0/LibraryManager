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
