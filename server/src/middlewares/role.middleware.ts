import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).user) {
        return res.status(500).json({ msg: "Se requiere verificar el token primero" });
    }

    if ((req as any).user.role !== 'admin') {
        return res.status(403).json({ msg: "Acceso prohibido: Se requieren permisos de administrador" });
    }

    next();
};