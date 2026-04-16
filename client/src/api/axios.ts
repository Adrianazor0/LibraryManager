import axios from 'axios';

const api = axios.create({
    baseURL: 'https://librarymanager-e13a.onrender.com/api',
});

api.interceptors.request.use((config) => {
const storage = localStorage.getItem('auth-storage');
  
  if (storage) {
    const authData = JSON.parse(storage);
    const token = authData.state.token; // Accedemos a la estructura de Zustand
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
    return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;