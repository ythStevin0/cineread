import api from './axiosInstance';

export const getFeaturedBooks = () => api.get('/books/featured');
export const getPopularBooks  = () => api.get('/books/popular');
export const getBookDetail    = (id) => api.get(`/books/${id}`);
export const searchBooks      = (q, page = 1) => api.get(`/books/search?q=${q}&page=${page}`);