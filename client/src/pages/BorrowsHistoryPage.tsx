import React, { useState, useEffect } from 'react';
import { useBorrowsHistory } from '../hooks/useBorrowsHistory';
import { 
  PrinterIcon, 
  SearchIcon, 
  CalendarIcon, 
  FileTextIcon,
  FilterIcon
} from 'lucide-react';

const BorrowsHistoryPage = () => {
  const { history, loading, fetchHistory } = useBorrowsHistory();
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: ''
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFilter = () => {
    fetchHistory(filters.startDate, filters.endDate, filters.status);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER - Hidden on print */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">Reporte Detallado de Préstamos</h1>
          <p className="text-gray-500 font-medium mt-1 flex items-center gap-2">
            <FileTextIcon size={18} className="text-blue-500" />
            Historial completo de movimientos y responsables
          </p>
        </div>
        
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all font-bold shadow-xl active:scale-95"
        >
          <PrinterIcon size={20} /> GENERAR REPORTE PDF
        </button>
      </div>

      {/* FILTERS - Hidden on print */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-wrap items-end gap-6 print:hidden">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Fecha Inicio</label>
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-2xl border border-transparent focus-within:border-blue-500 transition-all">
            <CalendarIcon size={18} className="text-blue-500" />
            <input 
              type="date" 
              className="bg-transparent font-bold text-gray-700 outline-none text-sm"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Fecha Fin</label>
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-2xl border border-transparent focus-within:border-blue-500 transition-all">
            <CalendarIcon size={18} className="text-blue-500" />
            <input 
              type="date" 
              className="bg-transparent font-bold text-gray-700 outline-none text-sm"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Estado</label>
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-2xl border border-transparent focus-within:border-blue-500 transition-all">
            <FilterIcon size={18} className="text-blue-500" />
            <select 
              className="bg-transparent font-bold text-gray-700 outline-none text-sm min-w-[120px]"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">Todos</option>
              <option value="prestado">En posesión</option>
              <option value="devuelto">Devueltos</option>
              <option value="atrasado">Atrasados</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleFilter}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 mb-1"
        >
          <SearchIcon size={24} />
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden print:shadow-none print:border-none">
        {/* Only visible on print */}
        <div className="hidden print:block p-8 text-center border-b-2 border-gray-100 mb-6">
          <h2 className="text-3xl font-black text-gray-800">Liceo La Ureña - Reporte de Préstamos</h2>
          <p className="text-gray-500 font-bold mt-2">
            Rango: {filters.startDate || 'Inicio'} hasta {filters.endDate || 'Hoy'}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 print:bg-gray-100 border-b border-gray-100">
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha Inicio</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Libro / ISBN</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Usuario</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vencimiento</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Atendido por</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center font-bold text-gray-400">Cargando datos...</td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center font-bold text-gray-400">No se encontraron registros en este rango.</td>
                </tr>
              ) : (
                history.map((row: any) => (
                  <tr key={row._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-6 font-bold text-gray-700 text-sm">
                      {new Date(row.departureDate).toLocaleDateString('es-DO')}
                    </td>
                    <td className="p-6">
                      <p className="font-bold text-blue-600 text-sm">{row.bookId?.title}</p>
                      <p className="text-[10px] text-gray-400 font-black">ISBN: {row.bookId?.isbn}</p>
                    </td>
                    <td className="p-6">
                      <p className="font-bold text-gray-800 text-sm">{row.userId?.name} {row.userId?.lastname}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{row.userId?.enrollmentId}</p>
                    </td>
                    <td className="p-6 font-bold text-gray-600 text-sm">
                      {new Date(row.dueDate).toLocaleDateString('es-DO')}
                    </td>
                    <td className="p-6">
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                        row.status === 'devuelto' ? 'bg-green-100 text-green-700' :
                        row.status === 'atrasado' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {row.status === 'prestado' ? 'En posesión' : row.status}
                      </span>
                    </td>
                    <td className="p-6">
                      <p className="font-bold text-gray-700 text-xs">
                        {row.approvedBy?.name} {row.approvedBy?.lastname}
                      </p>
                      <p className="text-[9px] text-blue-500 font-black uppercase">
                        {row.approvedBy?.role}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BorrowsHistoryPage;