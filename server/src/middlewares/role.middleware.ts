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

    export const isStaff = (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).user) {
        return res.status(500).json({ msg: "Se requiere verificar el token primero" });
    }

    const { role } = (req as any).user;
    if (role !== 'admin' && role !== 'bibliotecario') {
        return res.status(403).json({ msg: "Acceso prohibido: Se requieren permisos de personal (admin o bibliotecario)" });
    }

    next();
    };