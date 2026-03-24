import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || import.meta.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Pastikan selalu ada /api di akhir jika kita memanggil endpoint backend standar
if (API_URL && !API_URL.endsWith('/api')) {
  // Jika URL tidak diakhiri /api, tambahkan (kecuali jika memang sudah ada path lain)
  API_URL = API_URL.replace(/\/$/, '') + '/api';
}

const api = axios.create({
  baseURL: API_URL,
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