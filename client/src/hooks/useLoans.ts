import { useState } from 'react';
import api from '../api/axios';

export const useLoans = () => {
  const [loading, setLoading] = useState(false);

  const createLoan = async (loanData: { bookId: string; userId: string; daysBorrowed: number }) => {
    setLoading(true);
    try {
      const response = await api.post('/borrows/create', loanData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.msg || "Error al procesar el préstamo";
    } finally {
      setLoading(false);
    }
  };

  return { createLoan, loading };
};