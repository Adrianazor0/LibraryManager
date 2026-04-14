import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

export const signUp = async (req: Request, res: Response) => {
    const { enrollmentId, name, lastname, email, password, role } = req.body;

    try {
        const ifUser = await User.findOne({ $or: [{ enrollmentId }, { email }] });
        if (ifUser) {
            return res.status(400).json({ msg: "La matrícula o el correo ya están registrados" });
        }

        const newUser = new User({
            enrollmentId,
            name,
            lastname,
            email,
            password,
            role: role || 'estudiante'
        });

        await newUser.save();
        res.status(201).json({ msg: "Usuario creado con éxito" });
    } catch (error) {
        res.status(500).json({ msg: "Error al registrar usuario", error });
    }
};

export const signIn = async (req: Request, res: Response) => {
    const { enrollmentId, password } = req.body;

    try {
        const user = await User.findOne({ enrollmentId });
        if (!user) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }

        const isMatch = await (user as any).compararPassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Contraseña incorrecta" });
        }

        const payload = {
            id: user._id,
            role: user.role,
            enrollmentId: user.enrollmentId
        };

        const token = jwt.sign(
            payload, 
            process.env.JWT_SECRET || 'secret_para_desarrollo', 
            { expiresIn: '24h' } 
        );

        res.json({
            token,
            usuario: {
                nombre: user.name,
                role: user.role,
                enrollmentId: user.enrollmentId
            }
        });

    } catch (error) {
        res.status(500).json({ msg: "Error en el inicio de sesión" });
    }
};