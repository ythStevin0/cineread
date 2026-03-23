import Modal from '../ui/Modal';
import useAuthStore from '../../store/authStore';
import useAppStore from '../../store/appStore';
import { addFavorite, removeFavorite, addHistory } from '../../api/authApi';
import { useEffect } from 'react';

const TvModal = ({ show, isOpen, onClose }) => {
  const { user }    = useAuthStore();
  const { favorites, addFavorite: addFav, removeFavorite: removeFav } = useAppStore();

  const isFav = favorites.some(
    (f) => f.itemId === String(show?.id) && f.itemType === 'tv'
  );

  // Catat history saat modal dibuka
  useEffect(() => {
    if (isOpen && show && user) {
      addHistory({
        itemId:   String(show.id),
        itemType: 'tv',
        title:    show.title,
        poster:   show.poster,
      }).catch(() => {});
    }
  }, [isOpen, show, user]);

  const handleFavorite = async () => {
    if (!user) return alert('Login dulu untuk menyimpan favorit!');
    try {
      if (isFav) {
        await removeFavorite(show.id, 'tv');
        removeFav(String(show.id), 'tv');
      } else {
        await addFavorite({
          itemId:   String(show.id),
          itemType: 'tv',
          title:    show.title,
          poster:   show.poster,
          rating:   show.rating,
        });
        addFav({ itemId: String(show.id), itemType: 'tv', title: show.title, poster: show.poster });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!show) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Backdrop image */}
      {show.backdrop && (
        <div className="relative h-48 overflow-hidden rounded-t-2xl">
          <img src={show.backdrop} alt={show.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        </div>
      )}

      <div className="p-6">
        <div className="flex gap-4">
          {/* Poster */}
          {show.poster && (
            <img
              src={show.poster}
              alt={show.title}
              className="w-24 h-36 object-cover rounded-lg flex-shrink-0 -mt-16 border-2 border-border shadow-xl"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{show.title}</h2>
              <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded flex-shrink-0">TV</span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400 flex-wrap">
              <span>⭐ {show.rating || 'N/A'}</span>
              <span>📅 {show.releaseYear}</span>
              {show.seasons && <span>🎞 {show.seasons} Season</span>}
              {show.status && <span className="capitalize">{show.status}</span>}
            </div>
            {show.genres?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {show.genres.map((g) => (
                  <span key={g} className="text-xs bg-surface border border-border px-2 py-0.5 rounded-full text-gray-300">
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Overview */}
        {show.overview && (
          <p className="mt-4 text-sm text-gray-300 leading-relaxed line-clamp-4">
            {show.overview}
          </p>
        )}

        {/* Trailer */}
        {show.trailerLink && show.trailerLink.isYoutube && (
          <div className="mt-4 rounded-xl overflow-hidden aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${show.trailerLink.key}`}
              className="w-full h-full"
              allowFullScreen
              title="Trailer"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-6">
          {/* Trailer Link (non-YouTube or fallback) */}
          {show.trailerLink && !show.trailerLink.isYoutube && (
            <a
              href={show.trailerLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-surface border border-border hover:border-accent text-white text-xs font-semibold py-2 rounded-lg text-center transition-colors"
            >
              🎬 Trailer ({show.trailerLink.platform})
            </a>
          )}

          {/* Streaming Link */}
          {show.nontonLink && (
            <a
              href={show.nontonLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-accent hover:bg-red-700 text-white text-xs font-semibold py-2 rounded-lg text-center transition-colors"
            >
              ▶ Tonton di {show.nontonLink.platform}
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

export default TvModal;
