import Modal from '../ui/Modal';
import useAuthStore from '../../store/authStore';
import useAppStore from '../../store/appStore';
import { addFavorite, removeFavorite, addHistory } from '../../api/authApi';
import { useEffect } from 'react';

const MovieModal = ({ movie, isOpen, onClose }) => {
  const { user }    = useAuthStore();
  const { favorites, addFavorite: addFav, removeFavorite: removeFav } = useAppStore();

  const isFav = favorites.some(
    (f) => f.itemId === String(movie?.id) && f.itemType === 'movie'
  );

  // Catat history saat modal dibuka
  useEffect(() => {
    if (isOpen && movie && user) {
      addHistory({
        itemId:   String(movie.id),
        itemType: 'movie',
        title:    movie.title,
        poster:   movie.poster,
      }).catch(() => {});
    }
  }, [isOpen, movie, user]);

  const handleFavorite = async () => {
    if (!user) return alert('Login dulu untuk menyimpan favorit!');
    try {
      if (isFav) {
        await removeFavorite(movie.id, 'movie');
        removeFav(String(movie.id), 'movie');
      } else {
        await addFavorite({
          itemId:   String(movie.id),
          itemType: 'movie',
          title:    movie.title,
          poster:   movie.poster,
          rating:   movie.rating,
        });
        addFav({ itemId: String(movie.id), itemType: 'movie', title: movie.title, poster: movie.poster });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!movie) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Backdrop image */}
      {movie.backdrop && (
        <div className="relative h-48 overflow-hidden rounded-t-2xl">
          <img src={movie.backdrop} alt={movie.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        </div>
      )}

      <div className="p-6">
        <div className="flex gap-4">
          {/* Poster */}
          {movie.poster && (
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-24 h-36 object-cover rounded-lg flex-shrink-0 -mt-16 border-2 border-border shadow-xl"
            />
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white">{movie.title}</h2>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400 flex-wrap">
              <span>⭐ {movie.rating || 'N/A'}</span>
              <span>📅 {movie.releaseYear}</span>
              {movie.runtime && <span>⏱ {movie.runtime}</span>}
            </div>
            {movie.genres?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {movie.genres.map((g) => (
                  <span key={g} className="text-xs bg-surface border border-border px-2 py-0.5 rounded-full text-gray-300">
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Overview */}
        {movie.overview && (
          <p className="mt-4 text-sm text-gray-300 leading-relaxed line-clamp-4">
            {movie.overview}
          </p>
        )}

        {/* Trailer */}
        {movie.trailerKey && (
          <div className="mt-4 rounded-xl overflow-hidden aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${movie.trailerKey}`}
              className="w-full h-full"
              allowFullScreen
              title="Trailer"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          {/* Streaming Link */}
{movie.streamingLink && (
            <a
              href={movie.streamingLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-accent hover:bg-red-700 text-white text-sm font-semibold py-2.5 rounded-xl text-center transition-colors"
            >
              ▶ Tonton di {movie.streamingLink.platform}
            </a>
          )}

          {/* Favorite */}
          <button
            onClick={handleFavorite}
            className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
              isFav
                ? 'bg-accent border-accent text-white'
                : 'border-border text-gray-300 hover:border-accent hover:text-accent'
            }`}
          >
            {isFav ? '❤️ Favorit' : '🤍 Favorit'}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-border text-gray-400 hover:text-white text-sm transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MovieModal;