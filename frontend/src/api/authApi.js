import api from './axiosInstance';

export const register    = (data) => api.post('/auth/register', data);
export const login       = (data) => api.post('/auth/login', data);
export const getMe       = ()     => api.get('/auth/me');
export const getFavorites = ()    => api.get('/user/favorites');
export const addFavorite  = (data) => api.post('/user/favorites', data);
export const removeFavorite = (itemId, itemType) =>
  api.delete(`/user/favorites/${itemId}?itemType=${itemType}`);
export const getHistory  = ()     => api.get('/user/history');
export const addHistory  = (data) => api.post('/user/history', data);