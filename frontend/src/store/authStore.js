import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user:  JSON.parse(localStorage.getItem('cineread_user')) || null,
  token: localStorage.getItem('cineread_token') || null,

  setAuth: (user, token) => {
    localStorage.setItem('cineread_user',  JSON.stringify(user));
    localStorage.setItem('cineread_token', token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('cineread_user');
    localStorage.removeItem('cineread_token');
    set({ user: null, token: null });
  },
}));

export default useAuthStore;