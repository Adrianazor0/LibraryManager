import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import User from '../models/User';

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ msg: "Acceso denegado. No hay token." });
    }

    try {
        const decoded = (jwt.verify(token, process.env.JWT_SECRET || 'secret_para_desarrollo')) as any;
        
        // Verificamos el estado del usuario en la BD para revocación inmediata
        const user = await User.findById(decoded.id);
        
        if (!user || user.status !== 'activo') {
            const reason = user?.status === 'suspendido' ? "Tu cuenta ha sido suspendida." : 
                           user?.status === 'eliminado' ? "Tu cuenta ha sido eliminada del sistema." :
                           "Usuario no encontrado.";
            return res.status(401).json({ msg: reason });
        }

        (req as any).user = decoded;
        next(); 
    } catch (error) {
        res.status(401).json({ msg: "Token no válido o expirado" });
    }
};