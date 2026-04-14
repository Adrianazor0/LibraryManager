import { Request, Response } from 'express';
import { IUser } from '../interfaces/models.interface';
import User from '../models/User';

export const getUser = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let filter = {};

    if (search) {
      // Usamos un casting a string para evitar errores de tipo con regex
      const searchStr = String(search);
      filter = {
        $or: [
          { name: { $regex: searchStr, $options: 'i' } },
          { lastname: { $regex: searchStr, $options: 'i' } },
          { enrollmentId: { $regex: searchStr, $options: 'i' } }
        ]
      };
    }

    const users: IUser[] = await User.find(filter).limit(10);
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener usuarios' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ msg: error instanceof Error ? error.message : "Error al crear el usuario"     });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 1. Evitamos que se modifique el ID manualmente
    delete updateData._id;

    // 2. Manejo de contraseña (opcional)
    // Si el campo password viene vacío, lo eliminamos para no borrar la clave actual
    if (!updateData.password || updateData.password.trim() === "") {
      delete updateData.password;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true } // new: true devuelve el usuario ya cambiado
    ).select('-password'); // Por seguridad, no devolvemos la contraseña en la respuesta

    if (!updatedUser) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    res.json(updatedUser);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ msg: "El correo o la matrícula ya están en uso" });
    }
    res.status(500).json({ msg: "Error al actualizar usuario", error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Podrías añadir una validación aquí: 
    // No permitir que un usuario se borre a sí mismo si es el único admin
    
    const userDeleted = await User.findByIdAndDelete(id);

    if (!userDeleted) {
      return res.status(404).json({ msg: "El usuario ya no existe" });
    }

    res.json({ msg: "Usuario eliminado correctamente", id });
  } catch (error) {
    res.status(500).json({ msg: "Error al eliminar usuario" });
  }
};