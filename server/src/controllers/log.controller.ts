import { Request, Response } from 'express';
import ActivityLog from '../models/ActivityLog';

export const getLogs = async (req: Request, res: Response) => {
  try {
    const { action, limit = 50, page = 1 } = req.query;
    
    // Filtro opcional por tipo de acción (ej: solo PRESTAMOS)
    const query = action ? { action } : {};

    const logs = await ActivityLog.find(query)
      .populate('user', 'name lastname role') // Traemos datos del admin que hizo la acción
      .sort({ timestamp: -1 }) // Los más recientes primero
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await ActivityLog.countDocuments(query);

    res.json({
      logs,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page)
    });
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener la trazabilidad" });
  }
};