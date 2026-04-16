import { useState, useEffect } from 'react';
import api from '../api/axios';
import { ILibraryPolicy } from '../interfaces/user.interface';
import { 
  ShieldCheckIcon, 
  SaveIcon, 
  BookOpenIcon, 
  ClockIcon, 
  UserIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  Loader2Icon
} from 'lucide-react';

const PoliciesPage = () => {
  const [policies, setPolicies] = useState<ILibraryPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const { data } = await api.get('/policies');
      setPolicies(data);
    } catch (error) {
      console.error("Error al cargar políticas", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePolicy = async (policy: ILibraryPolicy) => {
    setSaving(policy._id);
    try {
      await api.put(`/policies/${policy._id}`, policy);
      // Opcional: Mostrar notificación de éxito
    } catch (error) {
      alert("Error al guardar los cambios");
    } finally {
      setSaving(null);
    }
  };

  const updateRuleValue = (policyIndex: number, ruleIndex: number, field: 'maxBooks' | 'loanDays', value: number) => {
    const newPolicies = [...policies];
    newPolicies[policyIndex].rules[ruleIndex][field] = value;
    setPolicies(newPolicies);
  };

  const toggleCanBorrow = (policyIndex: number) => {
    const newPolicies = [...policies];
    newPolicies[policyIndex].canBorrow = !newPolicies[policyIndex].canBorrow;
    setPolicies(newPolicies);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 space-y-4">
      <Loader2Icon className="animate-spin text-blue-600 w-12 h-12" />
      <p className="font-bold text-gray-500">Cargando normativas...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-800">Reglas de Biblioteca</h1>
          <p className="text-gray-500 font-medium">Configura los límites y tiempos por sección y rol</p>
        </div>
        <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-2xl flex items-center gap-2 font-bold">
          <ShieldCheckIcon size={20} /> Modo Administrador
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {policies.map((policy, pIdx) => (
          <div key={policy._id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            
            {/* Cabecera de Sección */}
            <div className={`p-6 flex justify-between items-center ${policy.canBorrow ? 'bg-blue-600' : 'bg-gray-800'} text-white`}>
              <div className="flex items-center gap-3">
                <BookOpenIcon />
                <h3 className="text-xl font-black">{policy.section}</h3>
              </div>
              <button 
                onClick={() => toggleCanBorrow(pIdx)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all font-bold"
              >
                {policy.canBorrow ? <ToggleRightIcon /> : <ToggleLeftIcon />}
                {policy.canBorrow ? 'Préstamo Permitido' : 'Solo Consulta'}
              </button>
            </div>

            {/* Cuerpo de Reglas */}
            <div className="p-8 space-y-6 flex-1">
              {policy.rules.map((rule, rIdx) => (
                <div key={rule.role} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
                  <div className="flex items-center gap-2 text-gray-800 font-black uppercase text-xs tracking-widest">
                    <UserIcon size={14} className="text-blue-600" /> Rol: {rule.role}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400">Libros Permitidos</label>
                      <input 
                        type="number" 
                        value={rule.maxBooks}
                        onChange={(e) => updateRuleValue(pIdx, rIdx, 'maxBooks', parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400">Días de Préstamo</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={rule.loanDays}
                          onChange={(e) => updateRuleValue(pIdx, rIdx, 'loanDays', parseInt(e.target.value) || 0)}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <ClockIcon className="absolute right-3 top-2.5 text-gray-300" size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Botón de Guardar */}
            <div className="p-6 bg-gray-50/50 border-t border-gray-100 text-right">
              <button 
                onClick={() => handleUpdatePolicy(policy)}
                disabled={saving === policy._id}
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-2xl font-black transition-all disabled:opacity-50"
              >
                {saving === policy._id ? <Loader2Icon className="animate-spin" /> : <SaveIcon size={20} />}
                {saving === policy._id ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PoliciesPage;
