import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

if (typeof window !== 'undefined') {
  console.log('🌐 API_URL configurada:', API_URL);
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {

    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('providence_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);


apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const url = error.config?.url;
      const data = error.response.data;
      
      console.error(`❌ Error ${status} en ${url}:`, data);
      
       if (status === 401) {
        console.error('🔐 No autorizado - Token inválido o expirado');
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/login')) {
            localStorage.removeItem('providence_token');
            localStorage.removeItem('providence_user');
            setTimeout(() => { window.location.href = '/login'; }, 1000);
          }
        }
      }
    } else if (error.request) {
      console.error('❌ No se recibió respuesta del servidor:', error.request);
    } else {
      console.error('❌ Error configurando request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('providence_token') : null;
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

export { API_URL };