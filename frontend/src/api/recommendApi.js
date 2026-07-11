import api from './axiosInstance';

/**
 * Ambil rekomendasi personal (butuh login)
 * Berdasarkan history + favorites user → AI Hybrid Model
 */
export const getRecommendations = () => api.get('/recommend');

/**
 * Ambil film/TV serupa (tidak perlu login)
 * Berdasarkan Content-Based similarity dari AI atau TMDB fallback
 * 
 * @param {number|string} tmdbId - TMDB ID film/TV
 * @param {string} type - 'movie' atau 'tv'
 */
export const getSimilarItems = (tmdbId, type = 'movie') =>
  api.get(`/recommend/similar/${tmdbId}`, { params: { type } });
