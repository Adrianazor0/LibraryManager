import { useState } from 'react';
import api from '../api/axios';

export const useCirculation = () => {
  const [activeLoans, setActiveLoans] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchActiveLoans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/borrows/actives'); // Ruta que crearemos
      setActiveLoans(res.data);
    } catch (err) {
      console.error("Error al cargar préstamos", err);
    } finally {
      setLoading(false);
    }
  };

  const returnBook = async (borrowId: string) => {
    try {
      await api.put(`/borrows/return/${borrowId}`);
      // Filtramos el array para quitar el que acabamos de devolver
      setActiveLoans((prev) => prev.filter((b: any) => b._id !== borrowId));
    } catch (err) {
      alert("Error al devolver el libro");
    }
  };

  return { activeLoans, loading, fetchActiveLoans, returnBook };
};