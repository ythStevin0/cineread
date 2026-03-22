import api from './axiosInstance';

export const getTrendingMovies = () => api.get('/movies/trending');
export const getPopularMovies  = (page = 1) => api.get(`/movies/popular?page=${page}`);
export const getMovieDetail    = (id) => api.get(`/movies/${id}`);
export const searchMovies      = (q, page = 1) => api.get(`/movies/search?q=${q}&page=${page}`);