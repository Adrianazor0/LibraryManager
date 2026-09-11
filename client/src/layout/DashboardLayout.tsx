import { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import UserProfileDropdown from '../components/UserProfileDropdown';
import { NotificationToast, NotificationItem } from '../components/NotificationToast';
import { 
  BookOpenIcon, 
  ArrowUpIcon, 
  UsersIcon, 
  ChartBarIcon, 
  HomeIcon,
  ShieldCheckIcon,
  BellIcon
} from 'lucide-react'; 

import { RagChatbotModal } from '../components/RagChatbotModal';

const DashboardLayout = () => {
  const user = useAuthStore((state) => state.user);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    const socketUrl = rawApiUrl.replace(/\/api\/?$/, '');

    const socket: Socket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('⚡ Conectado al servidor de notificaciones Socket.IO');
      socket.emit('join_admin_room');
    });

    socket.on('new_borrow_request', (data: NotificationItem) => {
      console.log('📱 Nueva solicitud de préstamo recibida vía Socket:', data);
      setNotifications(prev => [data, ...prev]);
    });

    socket.on('borrow_request_handled', (data: { id: string }) => {
      setNotifications(prev => prev.filter(n => n.id !== data.id));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 h-screen bg-blue-800 text-white flex flex-col shadow-xl sticky top-0">
        <div className="p-6 text-center border-b border-blue-700">
          <h2 className="text-xl font-bold">Liceo La Ureña</h2>
          <p className="text-xs text-blue-200 mt-1">Biblioteca Escolar</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center p-3 hover:bg-blue-700 rounded-lg transition-colors">
            <HomeIcon className="mr-3 w-5 h-5" /> Panel de Control
          </Link>
          <Link to="/dashboard/inventory" className="flex items-center p-3 hover:bg-blue-700 rounded-lg transition-colors">
            <BookOpenIcon className="mr-3 w-5 h-5" /> Gestión de Inventario
          </Link>
          <Link to="/dashboard/borrowsLanding" className="flex items-center p-3 hover:bg-blue-700 rounded-lg transition-colors">
            <ArrowUpIcon className="mr-3 w-5 h-5" /> Circulación (Préstamos)
            {notifications.length > 0 && (
              <span className="ml-auto bg-amber-400 text-indigo-950 font-black text-[10px] px-2 py-0.5 rounded-full animate-bounce">
                {notifications.length}
              </span>
            )}
          </Link>

          {user?.role === 'admin' && (
            <Link to="/dashboard/users" className="flex items-center p-3 hover:bg-blue-700 rounded-lg transition-colors">
              <UsersIcon className="mr-3 w-5 h-5" /> Administración de Usuarios
            </Link>
          )}

          <Link to="/dashboard/reports" className="flex items-center p-3 hover:bg-blue-700 rounded-lg transition-colors">
            <ChartBarIcon className="mr-3 w-5 h-5" /> Trazabilidad y Reportes
          </Link>
          
          {user?.role === 'admin' && (
            <Link to="/dashboard/policies" className="flex items-center p-3 hover:bg-orange-600 rounded-lg transition-colors bg-orange-500/10 mt-4 border border-orange-500/20">
              <ShieldCheckIcon className="mr-3 w-5 h-5 text-orange-400" /> Normativas y Reglas
            </Link>
          )}
        </nav>

        <div className="p-6 border-t border-blue-700 bg-blue-900/30">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold ring-2 ring-blue-400/30">
                {user?.name?.charAt(0).toUpperCase()}
             </div>
             <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{user?.name}</p>
                <p className="text-[10px] text-blue-300 uppercase tracking-wider font-semibold">{user?.role}</p>
             </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 border-b border-gray-100">
          <div className="flex items-center">
            <h1 className="text-gray-500 text-sm font-medium">Sistema de Gestión / <span className="text-gray-800 font-bold">Dashboard</span></h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Indicador de Notificaciones de Préstamos */}
            <div className="relative">
              <div className={`p-2 rounded-xl border transition-all ${notifications.length > 0 ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                <BellIcon size={18} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right mr-2 hidden md:block">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-tight">Usuario Activo</p>
              <p className="text-sm font-bold text-blue-700">{user?.name}</p>
            </div>
            <UserProfileDropdown />
          </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>

        {/* TOASTS DE NOTIFICACIONES EN TIEMPO REAL */}
        <NotificationToast notifications={notifications} onDismiss={handleDismissNotification} />

        {/* ASISTENTE CONVERSACIONAL RAG 24/7 */}
        <RagChatbotModal />
      </main>
    </div>
  );
};

export default DashboardLayout;