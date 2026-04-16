import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import UserProfileDropdown from '../components/UserProfileDropdown';
import { 
  BookOpenIcon, 
  ArrowUpIcon, 
  UsersIcon, 
  ChartBarIcon, 
  HomeIcon,
  ShieldCheckIcon
} from 'lucide-react'; 

const DashboardLayout = () => {
  const user = useAuthStore((state) => state.user);

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

      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 border-b border-gray-100">
          <div className="flex items-center">
            <h1 className="text-gray-500 text-sm font-medium">Sistema de Gestión / <span className="text-gray-800 font-bold">Dashboard</span></h1>
          </div>
          
          <div className="flex items-center space-x-4">
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
      </main>
    </div>
  );
};


export default DashboardLayout;