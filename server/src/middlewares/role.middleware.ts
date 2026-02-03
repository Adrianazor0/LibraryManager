import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(500).json({ msg: "Se requiere verificar el token primero" });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: "Acceso prohibido: Se requieren permisos de administrador" });
    }

    next();
};