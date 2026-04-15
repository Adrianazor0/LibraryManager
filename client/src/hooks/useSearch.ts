import { useState } from 'react';
import api from '../api/axios';

export const useSearch = () => {
  const [results, setResults] = useState({ books: [], users: [] });

  const searchBooks = async (query: string) => {
    if (query.length < 2) return;
    try {
      const res = await api.get(`/books/catalog?search=${query}`); // Ajusta a tu ruta de búsqueda
      setResults(prev => ({ ...prev, books: res.data }));
    } catch (err) { console.error(err); }
  };

  const searchUsers = async (query: string) => {
    if (query.length < 2) return;
    try {
      const res = await api.get(`/users?search=${query}`); // Ajusta a tu ruta de búsqueda
      setResults(prev => ({ ...prev, users: res.data }));
    } catch (err) { console.error(err); }
  };

  return { results, searchBooks, searchUsers };
};