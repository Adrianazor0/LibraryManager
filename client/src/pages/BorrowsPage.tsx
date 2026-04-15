import React, { useState, useEffect } from 'react';
import {
  BookOpenIcon,
  CheckIcon,
  InboxIcon,
  XIcon,
  CalendarIcon,
  RefreshCcwIcon,
  UserCheckIcon,
  ShieldCheckIcon
} from 'lucide-react';
import axios from '../api/axios';
import UserPrivilegesModal from '../components/UserPrivilegesModal';

const BorrowsPage = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para el modal de privilegios
  const [privilegeModal, setPrivilegeModal] = useState({
    isOpen: false,
    userRole: '',
    userName: ''
  });

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  // ESTA ES LA FUNCIÓN CORRECTA PARA EL FRONTEND
  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      // Llamamos al endpoint del backend que creamos anteriormente
      const response = await axios.get('/borrows/pending'); 
      
      // Guardamos el array de préstamos en el estado
      setPendingRequests(response.data);
    } catch (error) {
      console.error("Error al obtener solicitudes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, dueDate: string) => {
    try {
      await axios.put(`/borrows/approve/${id}`, { dueDate });
      alert("¡Libro entregado físicamente! El stock ha sido actualizado.");
      fetchPendingRequests(); // Refrescamos la lista
    } catch (err: any) {
      alert(err.response?.data?.msg || "Error al procesar la entrega");
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm("¿Estás seguro de rechazar esta solicitud?")) return;
    try {
      await axios.delete(`/borrows/reject/${id}`);
      fetchPendingRequests(); // Refrescamos la lista
    } catch (err) {
      alert("No se pudo eliminar la solicitud.");
    }
  };

  const handleDateChange = (id: string, newDate: string) => {
    setPendingRequests((prev: any) => 
      prev.map((req: any) => 
        req._id === id ? { ...req, dueDate: newDate } : req
      )
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Despacho de Libros</h1>
          <p className="text-gray-500 font-medium mt-1 flex items-center gap-2">
            <UserCheckIcon size={18} className="text-blue-500" />
            Solo solicitudes validadas vía App Móvil
          </p>
        </div>
        <button
          onClick={fetchPendingRequests}
          className="p-4 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-blue-600"
        >
          <RefreshCcwIcon size={24} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Lista de Solicitudes */}
      <div className="grid gap-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-bounce mb-4">
              <BookOpenIcon size={48} className="mx-auto text-blue-200" />
            </div>
            <p className="text-gray-400 font-bold">Sincronizando con la nube...</p>
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-gray-100">
            <InboxIcon className="mx-auto w-16 h-16 text-gray-200 mb-6" />
            <h3 className="text-xl font-bold text-gray-400">Bandeja de entrada vacía</h3>
            <p className="text-gray-300">No hay estudiantes esperando entrega de libros.</p>
          </div>
        ) : (
          pendingRequests.map((req: any) => (
            <div
              key={req._id}
              className="group bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-50 flex flex-col lg:flex-row justify-between items-center gap-8 transition-all hover:border-blue-100"
            >
              <div className="flex gap-6 items-center flex-1">
                <div className="w-20 h-20 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white">
                  <BookOpenIcon size={32} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Solicitud Pendiente</span>
                  <h3 className="font-black text-gray-800 text-2xl leading-tight">{req.bookId?.title}</h3>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <div className="flex items-center gap-2">
                        <p className="text-gray-600 font-bold">
                          {req.userId?.name} {req.userId?.lastname}
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-gray-400 font-medium">{req.userId?.enrollmentId}</span>
                        </p>
                        <button 
                          onClick={() => setPrivilegeModal({ 
                            isOpen: true, 
                            userRole: req.userId?.role, 
                            userName: `${req.userId?.name} ${req.userId?.lastname}` 
                          })}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          title="Ver Privilegios"
                        >
                          <ShieldCheckIcon size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-xl shadow-lg shadow-blue-200">
                      <CalendarIcon size={16} className="text-white" />
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-white uppercase tracking-wider">
                          Inicio: {new Date(req.departureDate).toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                        {req.dueDate && (
                          <span className="text-[10px] font-bold text-blue-100 uppercase">
                            Duración: {Math.ceil((new Date(req.dueDate).getTime() - new Date(req.departureDate).getTime()) / (1000 * 60 * 60 * 24))} días
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-auto flex flex-row lg:flex-col gap-4">
                <div className="space-y-2 flex-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-center block lg:text-left">Devolución Estimada</label>
                  <div className="flex items-center gap-3 bg-gray-50 px-5 py-4 rounded-2xl border-2 border-transparent focus-within:border-blue-500">
                    <CalendarIcon size={20} className="text-blue-500" />
                    <input
                      type="date"
                      className="bg-transparent font-black text-gray-700 outline-none text-lg"
                      value={req.dueDate ? new Date(req.dueDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleDateChange(req._id, e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 w-full lg:w-auto">
                <button
                  onClick={() => handleReject(req._id)}
                  className="flex-1 lg:flex-none p-5 text-red-400 hover:bg-red-50 rounded-2xl transition-all"
                >
                  <XIcon size={28} />
                </button>
                <button
                  onClick={() => handleApprove(req._id, req.dueDate)}
                  className="flex-[2] lg:flex-none px-10 py-5 bg-gray-900 hover:bg-blue-600 text-white rounded-2xl font-black shadow-xl transition-all flex items-center justify-center gap-3"
                >
                  <CheckIcon size={24} /> ENTREGAR LIBRO
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Privilegios */}
      <UserPrivilegesModal 
        isOpen={privilegeModal.isOpen}
        onClose={() => setPrivilegeModal({ ...privilegeModal, isOpen: false })}
        userRole={privilegeModal.userRole}
        userName={privilegeModal.userName}
      />
    </div>
  );
};

export default BorrowsPage;