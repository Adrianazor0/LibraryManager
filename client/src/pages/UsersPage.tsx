import React, { useEffect, useState } from 'react';
import { User, useUsers } from '../hooks/useUsers';
import {
  UserPlusIcon, SearchIcon, ContactIcon,
  MailIcon, GraduationCapIcon, Edit3Icon,
  Trash2Icon, XCircleIcon, SaveIcon, ShieldCheckIcon
} from 'lucide-react';
import UserPrivilegesModal from '../components/UserPrivilegesModal';

const UsersPage = () => {
  const { users, loading, fetchUsers, addUser, updateUser, deleteUser } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Estados para el modal de privilegios
  const [privilegeModal, setPrivilegeModal] = useState({
    isOpen: false,
    userRole: '',
    userName: ''
  });

  const initialUserState = {
    name: '',
    lastname: '',
    enrollmentId: '',
    email: '',
    password: '',
    status: 'activo' as 'activo' | 'suspendido', // <--- CAMBIO AQUÍ
    role: 'estudiante' as 'estudiante' | 'docente' | 'admin' | 'bibliotecario'
  };

  const [newUser, setNewUser] = useState<Omit<User, '_id'>>(initialUserState);

  useEffect(() => {
    fetchUsers(searchTerm);
  }, [searchTerm]);

  // Lógica para preparar la edición
  const handleEditClick = (user: User) => {
    setNewUser({
      name: user.name,
      lastname: user.lastname,
      enrollmentId: user.enrollmentId,
      email: user.email,
      password: '',
      status: user.status,
      role: user.role
    });
    setCurrentUserId(user._id);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentUserId) {
        const res = await updateUser(currentUserId, newUser);
        if (res.success) alert("Usuario actualizado");
      } else {
        const res = await addUser(newUser);
        if (res.success) alert("Usuario registrado");
      }

      // Resetear estados
      setShowForm(false);
      setIsEditing(false);
      setCurrentUserId(null);
      setNewUser(initialUserState);
    } catch (err: any) {
      alert(err);
    }
  };

  const cancelEdit = () => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentUserId(null);
    setNewUser(initialUserState);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">Comunidad Educativa</h1>
          <p className="text-gray-500 font-medium">Gestión de identidades y privilegios de acceso</p>
        </div>
        <button
          onClick={() => isEditing ? cancelEdit() : setShowForm(!showForm)}
          className={`${isEditing ? 'bg-gray-800' : 'bg-blue-600'} hover:opacity-90 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95`}
        >
          {isEditing ? <XCircleIcon className="w-5 h-5" /> : <UserPlusIcon className="w-5 h-5" />}
          {isEditing ? 'Cancelar Edición' : (showForm ? 'Cerrar Registro' : 'Nuevo Usuario')}
        </button>
      </div>

      {/* Formulario de Registro / Edición */}
      {showForm && (
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-blue-50 shadow-2xl animate-in slide-in-from-top duration-500 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
          <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
            {isEditing ? 'Actualizar Información de Usuario' : 'Registrar Nuevo Miembro'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input required placeholder="Nombre" className="p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
              value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />

            <input required placeholder="Apellido" className="p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
              value={newUser.lastname} onChange={(e) => setNewUser({ ...newUser, lastname: e.target.value })} />

            <input required placeholder="Matrícula / ID" className="p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
              value={newUser.enrollmentId} onChange={(e) => setNewUser({ ...newUser, enrollmentId: e.target.value })} />

            <input required type="email" placeholder="Correo Institucional" className="p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />

            <input type="password" placeholder={isEditing ? "Nueva contraseña (opcional)" : "Contraseña de acceso"}
              className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
              value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required={!isEditing} />

            <div className="grid grid-cols-2 gap-4">
              <select className="p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-600"
                value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}>
                <option value="estudiante">🎓 Estudiante</option>
                <option value="docente">👨‍🏫 Docente</option>
                <option value="bibliotecario">📚 Bibliotecario</option>
                <option value="admin">💼 Administrativo</option>
              </select>

              <select className="p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-600"
                value={newUser.status} onChange={(e) => setNewUser({ ...newUser, status: e.target.value as any })}>
                <option value="activo">🟢 Activo</option>
                <option value="suspendido">🔴 Suspendido</option>
              </select>
            </div>

            <div className="md:col-span-3 flex justify-end gap-3 pt-4 border-t border-gray-50">
              {isEditing && (
                <button type="button" onClick={cancelEdit} className="px-8 py-4 text-gray-400 font-bold hover:bg-gray-100 rounded-2xl transition-all">
                  Descartar
                </button>
              )}
              <button className={`flex items-center gap-2 px-10 py-4 ${isEditing ? 'bg-blue-600' : 'bg-green-600'} text-white font-black rounded-2xl hover:opacity-90 transition-all shadow-xl`}>
                <SaveIcon size={20} />
                {isEditing ? 'ACTUALIZAR DATOS' : 'GUARDAR USUARIO'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Buscador */}
      <div className="relative group">
        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          placeholder="Buscar por nombre, matrícula o correo..."
          className="w-full pl-16 pr-6 py-6 bg-white border-2 border-transparent rounded-[2.5rem] shadow-sm outline-none focus:border-blue-100 focus:ring-4 focus:ring-blue-50 transition-all text-lg font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid de Usuarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-black text-gray-400 uppercase tracking-widest">Sincronizando comunidad...</p>
          </div>
        ) : (
          users.map((user) => (
            <div key={user._id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 transition-all group relative">
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-[1.5rem] ${
                  user.role === 'docente' ? 'bg-purple-100 text-purple-600' : 
                  user.role === 'admin' ? 'bg-orange-100 text-orange-600' : 
                  user.role === 'bibliotecario' ? 'bg-indigo-100 text-indigo-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <GraduationCapIcon className="w-7 h-7" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter ${user.status === 'activo' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {user.status}
                  </span>
                  <button 
                    onClick={() => setPrivilegeModal({ isOpen: true, userRole: user.role, userName: `${user.name} ${user.lastname}` })}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all border border-blue-100 font-bold text-[10px] uppercase tracking-wider"
                  >
                    <ShieldCheckIcon size={12} /> Privilegios
                  </button>
                </div>
              </div>

              <h3 className="text-2xl font-black text-gray-800 mb-1 leading-tight capitalize">
                {user.name} <span className="text-blue-600">{user.lastname}</span>
              </h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">{user.role}</p>

              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-600 gap-3 bg-gray-50 p-3 rounded-2xl">
                  <ContactIcon className="w-5 h-5 text-gray-400" />
                  <span className="font-bold">{user.enrollmentId}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 gap-3 bg-gray-50 p-3 rounded-2xl">
                  <MailIcon className="w-5 h-5 text-gray-400" />
                  <span className="truncate font-medium">{user.email}</span>
                </div>
              </div>

              {/* Botones de Acción CRUD */}
              <div className="mt-8 pt-6 border-t border-gray-50 flex gap-2">
                <button
                  onClick={() => handleEditClick(user)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all"
                >
                  <Edit3Icon size={16} /> Editar
                </button>
                <button
                  onClick={() => deleteUser(user._id)}
                  className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                >
                  <Trash2Icon size={18} />
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

export default UsersPage;