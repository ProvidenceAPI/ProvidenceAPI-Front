import axios from 'axios';

// URL de tu backend NestJS (ajusta según tu configuración)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Importante para CORS
});

// Interceptor para agregar token JWT (Bearer)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('providence_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    // Tu backend devuelve data directamente
    return response.data;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Manejo de errores comunes
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('providence_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Propaga el error para manejo específico
    return Promise.reject(error.response?.data || {
      message: 'Error de conexión con el servidor',
      status: error.response?.status || 500
    });
  }
);

export default api;