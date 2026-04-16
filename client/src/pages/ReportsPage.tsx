import { useNavigate } from 'react-router-dom';
import { useReports } from '../hooks/useReports';
import { 
  BarChart3Icon, HistoryIcon, BookCheckIcon, 
  ArrowUpRightIcon, AlertCircleIcon, FileTextIcon
} from 'lucide-react';

const ReportsPage = () => {
  const { logs, stats, loading } = useReports();
  const navigate = useNavigate();

  if (loading) return <div className="p-10 text-center font-black text-gray-400">GENERANDO AUDITORÍA...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">Trazabilidad y Reportes</h1>
          <p className="text-gray-500 font-medium mt-1">Inteligencia de datos y auditoría del sistema</p>
        </div>
        
        <button 
          onClick={() => navigate('/dashboard/reports/history')}
          className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-[2rem] hover:bg-blue-700 transition-all font-black shadow-xl shadow-blue-100 group"
        >
          <FileTextIcon size={20} className="group-hover:scale-110 transition-transform" />
          VER HISTORIAL DETALLADO
        </button>
      </div>

      {/* RENDER DE STATS (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
        <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 relative overflow-hidden">
          <BookCheckIcon className="absolute right-[-10px] bottom-[-10px] w-32 h-32 opacity-10" />
          <p className="text-blue-100 font-bold uppercase text-xs tracking-widest">Libros en Préstamo</p>
          <h2 className="text-5xl font-black mt-2">{stats?.summary?.activeLoans || 0}</h2>
          <div className="flex items-center gap-1 mt-4 text-blue-200 text-sm font-bold">
            <ArrowUpRightIcon size={16} /> <span>Activos actualmente</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Total Acervo</p>
          <h2 className="text-5xl font-black text-gray-800 mt-2">{stats?.summary?.totalBooks || 0}</h2>
          <p className="text-gray-500 text-sm font-medium mt-4">Títulos registrados en DB</p>
        </div>

        <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 shadow-sm relative overflow-hidden">
          <AlertCircleIcon className="absolute right-[-10px] bottom-[-10px] w-32 h-32 text-red-500 opacity-10" />
          <p className="text-red-400 font-bold uppercase text-xs tracking-widest">Libros Vencidos</p>
          <h2 className="text-5xl font-black text-red-600 mt-2">{stats?.summary?.overdueBooks || 0}</h2>
          <div className="flex items-center gap-1 mt-4 text-red-500 text-sm font-bold">
            <AlertCircleIcon size={16} /> <span>Retraso detectado</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* COLUMNA IZQUIERDA: TRAZABILIDAD (TIMELINE) */}
        <div className="lg:col-span-2 space-y-6 print:col-span-3">
          <div className="flex items-center gap-3 mb-2">
            <HistoryIcon className="text-blue-600" />
            <h3 className="text-2xl font-black text-gray-800">Línea de Tiempo</h3>
          </div>
          
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-50">
              {logs.map((log: any) => (
                <div key={log._id} className="p-6 hover:bg-gray-50 transition-colors flex gap-6 items-start">
                  <div className={`mt-1 w-3 h-3 rounded-full shrink-0 ${
                    log.action === 'PRESTAMO' ? 'bg-blue-500' : 
                    log.action === 'DEVOLUCION' ? 'bg-green-500' : 'bg-orange-500'
                  }`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-gray-800 uppercase text-xs tracking-tighter">
                        {log.action}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-[10px] font-bold text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-600 font-medium text-sm">{log.details}</p>
                    <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">
                      Ejecutado por: {log.user?.name} {log.user?.lastname}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: REPORTES (TOP BOOKS) */}
        <div className="space-y-6 print:hidden">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3Icon className="text-blue-600" />
            <h3 className="text-2xl font-black text-gray-800">Más Pedidos</h3>
          </div>
          
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
            {stats?.topBooks.map((book: any, index: number) => (
              <div key={index} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black text-gray-100 group-hover:text-blue-100 transition-colors">
                    0{index + 1}
                  </span>
                  <div>
                    <p className="font-bold text-gray-800 text-sm line-clamp-1">{book.title}</p>
                    <p className="text-[10px] font-black text-blue-500 uppercase">{book.count} Préstamos</p>
                  </div>
                </div>
                <div className="h-2 w-16 bg-gray-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full" 
                    style={{ width: `${(book.count / stats.topBooks[0].count) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportsPage;