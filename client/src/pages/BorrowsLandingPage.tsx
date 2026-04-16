import { useNavigate } from 'react-router-dom';
import { PlusCircleIcon, ListTodoIcon, ArrowRightIcon } from 'lucide-react';

const BorrowsLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-gray-800 tracking-tight">Gestión de Circulación</h1>
        <p className="text-gray-500 font-medium text-lg">¿Qué acción deseas realizar hoy?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
        
        {/* BOTÓN: NUEVO PRÉSTAMO */}
        <button 
          onClick={() => navigate('/BorrowsPage')}
          className="group relative bg-white p-10 rounded-[3rem] border-2 border-transparent hover:border-blue-500 shadow-xl shadow-blue-900/5 transition-all duration-300 text-left overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
              <PlusCircleIcon className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Nuevo Préstamo</h2>
            <p className="text-gray-500 font-medium leading-relaxed">
              Registra la salida de un libro para un estudiante o docente.
            </p>
            <div className="mt-6 flex items-center text-blue-600 font-bold gap-2">
              Comenzar registro <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </button>

        {/* BOTÓN: VER CIRCULACIÓN */}
        <button 
          onClick={() => navigate('/BorrowsActivePage')}
          className="group relative bg-white p-10 rounded-[3rem] border-2 border-transparent hover:border-orange-500 shadow-xl shadow-orange-900/5 transition-all duration-300 text-left overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-orange-50 rounded-full group-hover:scale-150 transition-transform duration-500" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-orange-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-200">
              <ListTodoIcon className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">En Circulación</h2>
            <p className="text-gray-500 font-medium leading-relaxed">
              Revisa libros pendientes, gestiona devoluciones y atrasos.
            </p>
            <div className="mt-6 flex items-center text-orange-600 font-bold gap-2">
              Ver listado <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </button>

      </div>
    </div>
  );
};

export default BorrowsLanding;