import React, { useEffect } from 'react';
import { useCirculation } from '../hooks/useCirculation';
import { CheckCircleIcon, AlertTriangleIcon, SearchIcon, CalendarIcon } from 'lucide-react';

const CirculationsPage = () => {
  const { activeLoans, loading, fetchActiveLoans, returnBook } = useCirculation();

  useEffect(() => { fetchActiveLoans(); }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-800">Circulación Activa</h1>
        <p className="text-gray-500 font-medium">Libros que deben regresar a los estantes</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Usuario</th>
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Libro / ISBN</th>
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Fecha Inicio</th>
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Duración</th>
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Vencimiento</th>
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {activeLoans.map((borrow: any) => {
                const isOverdue = new Date(borrow.dueDate) < new Date();
                const diffDays = Math.ceil((new Date(borrow.dueDate).getTime() - new Date(borrow.departureDate).getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <tr key={borrow._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-6">
                      <p className="font-bold text-gray-800">{borrow.userId?.name} {borrow.userId?.lastname}</p>
                      <p className="text-xs text-gray-400 font-medium">{borrow.userId?.enrollmentId}</p>
                    </td>
                    <td className="p-6">
                      <p className="font-bold text-blue-600">{borrow.bookId?.title}</p>
                      <p className="text-xs text-gray-400 font-medium">ISBN: {borrow.bookId?.isbn}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 font-bold text-gray-600">
                        <CalendarIcon className="w-4 h-4 text-blue-500" />
                        {new Date(borrow.departureDate).toLocaleDateString('es-DO')}
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                        {diffDays} días
                      </span>
                    </td>
                    <td className="p-6">
                      <div className={`flex items-center gap-2 font-bold ${isOverdue ? 'text-red-500' : 'text-gray-600'}`}>
                        <CalendarIcon className="w-4 h-4" />
                        {new Date(borrow.dueDate).toLocaleDateString('es-DO')}
                        {isOverdue && <AlertTriangleIcon className="w-4 h-4 animate-pulse" />}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => {
                          if(window.confirm("¿Confirmas que el libro ha regresado en buen estado?")) returnBook(borrow._id);
                        }}
                        className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-green-600 hover:text-white transition-all flex items-center gap-2 ml-auto"
                      >
                        <CheckCircleIcon className="w-4 h-4" /> Devolver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {activeLoans.length === 0 && !loading && (
            <div className="p-20 text-center text-gray-400 font-medium">
              No hay libros pendientes de devolución. 🎉
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CirculationsPage;