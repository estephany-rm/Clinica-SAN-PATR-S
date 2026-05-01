// Cliente Axios centralizado con interceptor JWT
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://localhost:3001/api
  timeout: 10000,
});

// Interceptor de petición: agrega el JWT automáticamente
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('clinica_user');
    if (stored) {
      const { token } = JSON.parse(stored);
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta: maneja errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado: limpiar sesión y redirigir
      localStorage.removeItem('clinica_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;