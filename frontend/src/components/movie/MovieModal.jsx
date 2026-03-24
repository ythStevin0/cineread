import Modal from '../ui/Modal';
import useAuthStore from '../../store/authStore';
import useAppStore from '../../store/appStore';
import { addFavorite, removeFavorite, addHistory } from '../../api/authApi';
import { useEffect, useState } from 'react';
import { getMovieDetail } from '../../api/movieApi';
import LoadingSpinner from '../ui/LoadingSpinner';

const MovieModal = ({ movie, isOpen, onClose }) => {
  const { user }    = useAuthStore();
  const { favorites, addFavorite: addFav, removeFavorite: removeFav } = useAppStore();

  const isFav = favorites.some(
    (f) => f.itemId === String(movie?.id) && f.itemType === 'movie'
  );

  const [movieData, setMovieData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch full details saat modal dibuka
  useEffect(() => {
    if (isOpen && movie?.id) {
      setIsLoading(true);
      getMovieDetail(movie.id)
        .then(res => {
          if (res.data?.data) setMovieData(res.data.data);
        })
        .catch(err => console.error("Gagal mengambil detail:", err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, movie]);

  const displayData = movieData || movie;

  // Catat history saat modal dibuka
  useEffect(() => {
    if (isOpen && displayData && user) {
      addHistory({
        itemId:   String(displayData.id),
        itemType: 'movie',
        title:    displayData.title,
        poster:   displayData.poster,
      }).catch(() => {});
    }
  }, [isOpen, displayData, user]);

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
      {/* Top Media: YouTube Trailer */}
      <div className="relative w-full aspect-video overflow-hidden rounded-t-2xl bg-black">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
            <LoadingSpinner />
          </div>
        ) : displayData.trailerKey ? (
          <iframe
            src={`https://www.youtube.com/embed/${displayData.trailerKey}?autoplay=0`}
            className="w-full h-full border-0"
            allowFullScreen
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title="Trailer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a] text-gray-500">
            <p>Trailer tidak tersedia</p>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex gap-4">
          {/* Poster */}
          {displayData.poster && (
            <img
              src={displayData.poster}
              alt={displayData.title}
              className="w-24 h-36 object-cover rounded-lg flex-shrink-0 -mt-16 border-2 border-border shadow-xl"
            />
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white">{displayData.title}</h2>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400 flex-wrap">
              <span>⭐ {displayData.rating || 'N/A'}</span>
              <span>📅 {displayData.releaseYear}</span>
              {displayData.runtime && <span>⏱ {displayData.runtime}</span>}
            </div>
            {displayData.genres?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {displayData.genres.map((g) => (
                  <span key={g} className="text-xs bg-[surface] border border-border px-2 py-0.5 rounded-full text-gray-300">
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Overview */}
        {displayData.overview && (
          <p className="mt-4 text-sm text-gray-300 leading-relaxed line-clamp-4">
            {displayData.overview}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-6">
          {/* External Trailer Link (Fallback) */}
          {displayData.trailerKey && (
            <a
              href={`https://www.youtube.com/watch?v=${displayData.trailerKey}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors flex items-center justify-center"
            >
              ▶ Buka di YouTube
            </a>
          )}

          {/* Favorite */}
          <button
            onClick={handleFavorite}
            className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
              isFav
                ? 'bg-accent border-accent text-white'
                : 'border-border text-gray-300 hover:border-accent hover:text-accent'
            }`}
          >
            {isFav ? '❤️' : '🤍'}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg border border-border text-gray-400 hover:text-white text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MovieModal;