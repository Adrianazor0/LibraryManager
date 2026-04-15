import { useState, useEffect } from 'react';
import api from '../api/axios';

export const useDashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    activeBorrows: 0,
    registeredUsers: 0,
    overdueBooks: 0,
    recentBorrows: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      console.log("Dashboard stats:", res.data);
      setStats(res.data);
    } catch (err) {
      console.error("Error al cargar estadísticas", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  return { stats, loading, refresh: fetchStats };
};