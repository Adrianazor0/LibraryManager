import { useState } from 'react';
import api from '../api/axios';

export const useBorrowsHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async (startDate?: string, endDate?: string, status?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (status) params.append('status', status);

      const res = await api.get(`/borrows/history?${params.toString()}`);
      setHistory(res.data);
    } catch (err) {
      console.error("Error al cargar historial", err);
    } finally {
      setLoading(false);
    }
  };

  return { history, loading, fetchHistory };
};