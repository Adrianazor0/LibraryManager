import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { LogOutIcon, UserIcon, SettingsIcon, ShieldIcon } from 'lucide-react';

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón del Avatar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-md focus:ring-2 focus:ring-blue-300 outline-none"
      >
        {user?.name?.charAt(0).toUpperCase()}
      </button>

      {/* Menú Desplegable (Estilo Microsoft) */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden transform origin-top-right transition-all">
          {/* Encabezado del Perfil */}
          <div className="p-6 bg-gradient-to-br from-blue-50 to-white border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-gray-900 truncate">{user?.name}</p>
                <p className="text-sm text-gray-500 truncate">{user?.enrollmentId}</p>
                <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                  {user?.role}
                </div>
              </div>
            </div>
          </div>

          {/* Opciones del Menú */}
          <div className="py-2">
            <button className="w-full flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <UserIcon className="w-4 h-4 mr-3 text-gray-400" />
              Ver mi perfil
            </button>
            {user?.role === 'admin' && (
              <button 
                onClick={() => { navigate('/dashboard/policies'); setIsOpen(false); }}
                className="w-full flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ShieldIcon className="w-4 h-4 mr-3 text-gray-400" />
                Configuración de seguridad
              </button>
            )}
            <button className="w-full flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50">
              <SettingsIcon className="w-4 h-4 mr-3 text-gray-400" />
              Ajustes de cuenta
            </button>
          </div>

          {/* Botón de Cerrar Sesión */}
          <div className="p-4 bg-gray-50 flex justify-end">
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 text-sm font-semibold text-gray-700 rounded-md hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
            >
              <LogOutIcon className="w-4 h-4 mr-2" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
