import React, { useEffect, useState } from 'react';
import { XIcon, ShieldCheckIcon, BookIcon, ClockIcon, LayersIcon } from 'lucide-react';
import api from '../api/axios';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
  userName: string;
}

interface Policy {
  _id: string;
  section: string;
  canBorrow: boolean;
  rules: {
    role: string;
    maxBooks: number;
    loanDays: number;
  }[];
}

const UserPrivilegesModal = ({ isOpen, onClose, userRole, userName }: Props) => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchPolicies();
    }
  }, [isOpen]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/policies');
      setPolicies(res.data);
    } catch (err) {
      console.error("Error al obtener políticas", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
        
        {/* Header */}
        <div className="bg-blue-800 p-8 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
              <ShieldCheckIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Privilegios de {userName}</h2>
              <p className="text-blue-200 text-sm font-medium uppercase tracking-widest">Rol: {userRole}</p>
            </div>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="font-black text-gray-400 uppercase tracking-widest">Consultando normativas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {policies.map((policy) => {
                const rule = policy.rules.find(r => r.role === userRole);
                return (
                  <div key={policy._id} className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <LayersIcon className="w-5 h-5 text-blue-500" />
                        <h4 className="font-black text-gray-800 uppercase tracking-tight">{policy.section}</h4>
                      </div>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${policy.canBorrow ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {policy.canBorrow ? 'Préstamo Permitido' : 'Solo Consulta'}
                      </span>
                    </div>

                    {policy.canBorrow && rule ? (
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center">
                          <BookIcon className="w-5 h-5 text-blue-600 mb-1" />
                          <p className="text-[10px] font-black text-gray-400 uppercase">Máximo</p>
                          <p className="text-xl font-black text-blue-700">{rule.maxBooks} Libros</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center">
                          <ClockIcon className="w-5 h-5 text-blue-600 mb-1" />
                          <p className="text-[10px] font-black text-gray-400 uppercase">Tiempo</p>
                          <p className="text-xl font-black text-blue-700">{rule.loanDays} Días</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-100/50 p-6 rounded-2xl border border-dashed border-gray-200 text-center flex flex-col items-center justify-center h-full">
                        <XIcon className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="text-sm font-bold text-gray-400">Sin privilegios de préstamo externo para este rol en esta sección.</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-center">
          <button 
            onClick={onClose}
            className="px-12 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl uppercase text-xs tracking-widest"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPrivilegesModal;