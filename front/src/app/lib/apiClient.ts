import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('providence_token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

export const apiClient = axios.create({
  baseURL: API_URL,
});


apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('providence_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});