import { useState } from 'react';
import api from '../api/axios';

export interface User {
  _id: string;
  name: string;
  lastname: string;
  enrollmentId: string;
  email: string;
  password?: string; // Opcional porque no siempre la recibiremos del backend
  role: 'estudiante' | 'docente' | 'admin' | 'bibliotecario';
  status: 'activo' | 'suspendido';
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (search: string = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/users?search=${search}`);
      setUsers(res.data);
    } catch (err) {
      console.error("Error al obtener usuarios", err);
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (userData: Omit<User, '_id'>) => {
    try {
      const res = await api.post('/users', userData);
      setUsers((prev) => [...prev, res.data]);
      return { success: true, data: res.data };
    } catch (err: any) {
      const msg = err.response?.data?.msg || "Error al crear el usuario";
      return { success: false, error: msg };
    }
  };

  // --- NUEVAS FUNCIONES PARA EL CRUD ---

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      const res = await api.put(`/users/update/${id}`, userData);
      
      // Actualización optimista en el estado local
      setUsers((prev) => 
        prev.map((user) => (user._id === id ? { ...user, ...res.data } : user))
      );
      
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.msg || "Error al actualizar";
      return { success: false, error: msg };
    }
  };

  const deleteUser = async (id: string) => {
    // Confirmación nativa antes de proceder
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
      await api.delete(`/users/${id}`);
      
      // Filtramos el usuario eliminado del estado actual
      setUsers((prev) => prev.filter((user) => user._id !== id));
      
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.msg || "Error al eliminar";
      return { success: false, error: msg };
    }
  };

  return { 
    users, 
    loading, 
    fetchUsers, 
    addUser, 
    updateUser, 
    deleteUser 
  };
};