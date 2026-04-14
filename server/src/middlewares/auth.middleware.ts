import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ msg: "Acceso denegado. No hay token." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_para_desarrollo');
        (req as any).user = decoded;
        next(); 
    } catch (error) {
        res.status(401).json({ msg: "Token no válido" });
    }
};