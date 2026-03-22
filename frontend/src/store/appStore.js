import { create } from 'zustand';

const useAppStore = create((set) => ({
  favorites:    [],
  setFavorites: (favorites) => set({ favorites }),

  addFavorite: (item) => set((state) => ({
    favorites: [...state.favorites, item],
  })),

  removeFavorite: (itemId, itemType) => set((state) => ({
    favorites: state.favorites.filter(
      (f) => !(f.itemId === String(itemId) && f.itemType === itemType)
    ),
  })),

  isFavorite: (itemId, itemType) => (state) =>
    state.favorites.some(
      (f) => f.itemId === String(itemId) && f.itemType === itemType
    ),
}));

export default useAppStore;