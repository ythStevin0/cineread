import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Otomatis tambah token JWT ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cineread_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle response error global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cineread_token');
      localStorage.removeItem('cineread_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;