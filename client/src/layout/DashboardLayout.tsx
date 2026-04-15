import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { 
  BookOpenIcon, 
  ArrowUpIcon, 
  UsersIcon, 
  ChartBarIcon, 
  LogOutIcon,
  HomeIcon,
  ShieldCheckIcon
} from 'lucide-react'; 

const DashboardLayout = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
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

        <div className="p-4 border-t border-blue-700">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-semibold"
          >
            <LogOutIcon className="mr-3 w-5 h-5" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8">
          <span className="text-gray-600 font-medium">Bienvenido, <span className="text-blue-600 font-bold">{user?.name}</span></span>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              {user?.name?.charAt(0)}
            </div>
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