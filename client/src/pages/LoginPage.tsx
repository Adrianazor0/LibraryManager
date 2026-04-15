import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const LoginPage = () => {
  const [enrollmentId, setEnrollmentId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Petición al endpoint que ya probamos en el backend
      const response = await axios.post('http://localhost:4000/api/auth/signin', {
        enrollmentId,
        password
      });

      const { token, usuario } = response.data;

      // Centralizamos los datos capturando posibles variaciones de nombres
      const userData = {
        id: usuario.id || usuario._id,
        name: usuario.nombre || usuario.name,
        role: usuario.rol || usuario.role,
        enrollmentId: usuario.enrollmentId || usuario.enrollmentID
      };

      // Guardamos en Zustand
      setAuth(userData, token);

      // Redirigimos al Dashboard (Asegúrate de tener esta ruta creada)
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error("Error en login:", error);
      const mensaje = error.response?.data?.msg || "Error de conexión con el Liceo";
      alert(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-blue-700">Liceo La Ureña</h2>
          <p className="text-gray-500 mt-2">Gestión de Biblioteca Escolar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Matrícula</label>
            <input
              type="text"
              required
              className="mt-1 w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Ej: 2026-0001"
              value={enrollmentId}
              onChange={(e) => setEnrollmentId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Contraseña</label>
            <input
              type="password"
              required
              className="mt-1 w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
              loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'
            }`}
          >
            {loading ? 'Verificando...' : 'Entrar al Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;