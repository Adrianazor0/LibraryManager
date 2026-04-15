import { useState, useEffect } from 'react';
import api from '../api/axios';

interface DashboardStats {
  topBooks: Array<{ title: string; count: number }>;
  borrowStatus: Array<{ _id: string; total: number }>;
  summary: {
    totalBooks: number;
    activeLoans: number;
    overdueBooks: number;
    activeUsers?: number; // Opcional por si aún no lo calculas
  };
}

export const useReports = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReportData = async (startDate?: string, endDate?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('limit', '10');

      const [logsRes, statsRes] = await Promise.all([
        api.get(`/reports/logs?${params.toString()}`),
        api.get('/reports/stats')
      ]);
      setLogs(logsRes.data.logs);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error cargando reportes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  return { logs, stats, loading, refetch: fetchReportData };
};