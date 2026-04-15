import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { 
  BookIcon, 
  UsersIcon, 
  ArrowUpRightIcon, 
  AlertCircleIcon, 
  ClockIcon,
  PlusCircleIcon,
  InboxIcon,
  CheckCircleIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const DashboardPage = () => {
  const { stats, loading } = useDashboard();
  const user = useAuthStore((state) => state.user);

  const cards = [
    { title: 'Libros en Catálogo', value: stats.totalBooks, icon: BookIcon, color: 'bg-blue-500' },
    { title: 'Préstamos Activos', value: stats.activeBorrows, icon: ArrowUpRightIcon, color: 'bg-green-500' },
    { title: 'Comunidad', value: stats.registeredUsers, icon: UsersIcon, color: 'bg-purple-500' },
    { title: 'Vencidos / Atrasos', value: stats.overdueBooks, icon: AlertCircleIcon, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Bienvenida */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-800">Panel de Control</h1>
          <p className="text-gray-500 font-medium text-lg">Liceo La Ureña • {new Date().toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
            <div className={`w-12 h-12 ${card.color} text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
              <card.icon className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">{card.title}</p>
            <h3 className="text-4xl font-black text-gray-800 mt-1">
              {loading ? '...' : card.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Acciones Rápidas */}
        <div className="lg:col-span-1 bg-gray-900 rounded-[2.5rem] p-8 text-white space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <PlusCircleIcon className="text-blue-400" /> Acceso Rápido
          </h3>
          <div className="grid gap-4">
            <Link to="/BorrowsPage" className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all font-bold flex justify-between items-center group shadow-xl shadow-blue-500/20">
              Despachar Solicitudes <InboxIcon className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/dashboard/inventory" className="w-full py-4 px-6 bg-white/10 hover:bg-white/20 rounded-2xl transition-all font-bold flex justify-between items-center group">
              Registrar Libro <ArrowUpRightIcon className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/dashboard/reports" className="w-full py-4 px-6 bg-white/10 hover:bg-white/20 rounded-2xl transition-all font-bold flex justify-between items-center group">
              Auditoría y Reportes <ArrowUpRightIcon className="group-hover:translate-x-1 transition-transform" />
            </Link>
            {user?.role === 'admin' && (
              <Link to="/dashboard/users" className="w-full py-4 px-6 bg-white/10 hover:bg-white/20 rounded-2xl transition-all font-bold flex justify-between items-center group">
                Inscribir Usuario <ArrowUpRightIcon className="group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>

        {/* Actividad Reciente Mejorada */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <ClockIcon className="text-orange-500" /> Actividad Reciente
          </h3>
          <div className="space-y-4">
            {stats.recentBorrows.length > 0 ? (
              stats.recentBorrows.map((borrow) => {
                // Lógica de Estados
                const isPending = borrow.status === 'pendiente';
                const isReturned = borrow.status === 'devuelto';
                const isBorrowed = borrow.status === 'prestado';
                const isOverdue = borrow.status === 'atrasado';

                let actionText = "procesó";
                let actionColor = "text-blue-600";
                let bgColor = "bg-gray-50 border-blue-500";
                let badgeColor = "bg-blue-100 text-blue-700";
                let badgeLabel = "En Posesión";

                if (isPending) {
                    actionText = " solicitó ";
                    actionColor = "text-orange-600";
                    bgColor = "bg-orange-50/30 border-orange-400";
                    badgeColor = "bg-orange-100 text-orange-700";
                    badgeLabel = "Por Aprobar";
                } else if (isReturned) {
                    actionText = " devolvió ";
                    actionColor = "text-green-600";
                    bgColor = "bg-green-50/30 border-green-500";
                    badgeColor = "bg-green-600 text-white";
                    badgeLabel = "Completado";
                } else if (isOverdue) {
                    actionText = " tiene demorado ";
                    actionColor = "text-red-600";
                    bgColor = "bg-red-50/30 border-red-500";
                    badgeColor = "bg-red-100 text-red-700";
                    badgeLabel = "Atrasado";
                } else if (isBorrowed) {
                    actionText = " retiró ";
                    actionColor = "text-blue-600";
                    bgColor = "bg-blue-50/30 border-blue-600";
                    badgeColor = "bg-blue-100 text-blue-700";
                    badgeLabel = "En Posesión";
                }

                return (
                  <div 
                    key={borrow._id} 
                    className={`flex items-center justify-between p-4 transition-all rounded-2xl border-l-4 ${bgColor} hover:shadow-md`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        isPending ? 'bg-orange-100 text-orange-600' : 
                        isReturned ? 'bg-green-100 text-green-600' : 
                        isOverdue ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {borrow.userId?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm md:text-base">
                          {borrow.userId?.name} {borrow.userId?.lastname} 
                          <span className={`font-black ${actionColor}`}>
                            {actionText}
                          </span> 
                          "{borrow.bookId?.title}"
                        </p>
                        <p className="text-[10px] md:text-xs text-gray-400 font-medium">
                          {new Date(borrow.updatedAt).toLocaleTimeString('es-DO', { 
                            hour: '2-digit', minute: '2-digit' 
                          })} • {new Date(borrow.updatedAt).toLocaleDateString('es-DO', { 
                            month: 'short', day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="hidden md:block text-right">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider ${badgeColor}`}>
                        {badgeLabel}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-50 rounded-[2rem]">
                <ClockIcon className="mx-auto mb-2 opacity-20" size={40} />
                <p className="font-medium">No hay actividad reciente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;