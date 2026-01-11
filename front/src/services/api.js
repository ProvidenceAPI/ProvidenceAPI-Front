
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('providence_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      console.warn('⚠️ Sesión expirada, redirigiendo a login...');
      localStorage.removeItem('providence_token');
      localStorage.removeItem('providence_user');
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    if (error.response?.status === 403) {
      console.error('🚫 Acceso prohibido - verifica permisos');
    }
    return Promise.reject(error.response?.data || {
      message: 'Error de conexión con el servidor',
      status: error.response?.status || 500
    });
  }
);

export default api;
