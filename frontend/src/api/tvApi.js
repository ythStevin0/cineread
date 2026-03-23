import api from './axiosInstance';

export const getTrendingTv  = ()          => api.get('/tv/trending');
export const getPopularTv   = (page = 1)  => api.get(`/tv/popular?page=${page}`);
export const getTvDetail    = (id)        => api.get(`/tv/${id}`);
export const searchTv       = (q, page = 1) => api.get(`/tv/search?q=${q}&page=${page}`);
