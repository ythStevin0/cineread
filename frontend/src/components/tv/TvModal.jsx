import Modal from '../ui/Modal';
import useAuthStore from '../../store/authStore';
import useAppStore from '../../store/appStore';
import { addFavorite, removeFavorite, addHistory } from '../../api/authApi';
import { useEffect, useState } from 'react';
import { getTvDetail } from '../../api/tvApi';
import LoadingSpinner from '../ui/LoadingSpinner';

const TvModal = ({ show, isOpen, onClose }) => {
  const { user }    = useAuthStore();
  const { favorites, addFavorite: addFav, removeFavorite: removeFav } = useAppStore();

  const isFav = favorites.some(
    (f) => f.itemId === String(show?.id) && f.itemType === 'tv'
  );

  const [showData, setShowData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch full details saat modal dibuka
  useEffect(() => {
    if (isOpen && show?.id) {
      setIsLoading(true);
      getTvDetail(show.id)
        .then(res => {
          if (res.data?.data) setShowData(res.data.data);
        })
        .catch(err => console.error("Gagal mengambil detail:", err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, show]);

  const displayData = showData || show;

  // Catat history saat modal dibuka
  useEffect(() => {
    if (isOpen && displayData && user) {
      addHistory({
        itemId:   String(displayData.id),
        itemType: 'tv',
        title:    displayData.title,
        poster:   displayData.poster,
      }).catch(() => {});
    }
  }, [isOpen, displayData, user]);

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
      {/* Top Media: YouTube Trailer */}
      <div className="relative w-full aspect-video overflow-hidden rounded-t-2xl bg-black group">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
            <LoadingSpinner />
          </div>
        ) : displayData.trailers?.length > 0 ? (
          <>
            <iframe
              src={`https://www.youtube.com/embed/${displayData.trailers[0].key}?autoplay=0&modestbranding=1&rel=0`}
              className="w-full h-full border-0"
              allowFullScreen
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title="Trailer"
            />
            {/* Watermark Labels like in the image */}
            <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
                <div className="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center text-[10px] font-bold text-white border border-white/20">XXI</div>
                <h3 className="text-white text-sm font-medium drop-shadow-md truncate max-w-[200px]">{displayData.title} - Official Trailer</h3>
            </div>

            <div className="absolute top-4 right-4 flex gap-3 pointer-events-none">
                <div className="flex flex-col items-center gap-0.5 opacity-80">
                    <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                    </div>
                    <span className="text-[8px] text-white font-medium">Tonton nanti</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 opacity-80">
                    <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
                    </div>
                    <span className="text-[8px] text-white font-medium">Bagikan</span>
                </div>
            </div>

            <div className="absolute bottom-4 left-4 pointer-events-none flex items-end gap-2">
                <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-md flex items-center gap-2 border border-white/10">
                    <span className="text-[10px] font-bold text-white/70">Tonton di</span>
                    <svg className="h-3.5 fill-white" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </div>
            </div>

            <div className="absolute bottom-4 right-1/2 translate-x-1/2 opacity-60 pointer-events-none">
                <h1 className="text-4xl font-black text-white/20 tracking-tighter italic">TRAILER</h1>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a] text-gray-500">
            <p>Trailer tidak tersedia</p>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex gap-5">
          {/* Poster: Overlapping the trailer section */}
          {displayData.poster && (
            <img
              src={displayData.poster}
              alt={displayData.title}
              className="w-28 h-40 object-cover rounded-xl flex-shrink-0 -mt-20 border-4 border-[#121212] shadow-2xl relative z-10"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">{displayData.title}</h2>
              <span className="text-[10px] bg-blue-600/20 text-blue-400 border border-blue-400/30 font-bold px-1.5 py-0.5 rounded flex-shrink-0">TV</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-[13px] font-medium">
              <span className="flex items-center gap-1 text-yellow-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                {displayData.rating || 'N/A'}
              </span>
              <span className="flex items-center gap-1 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                {displayData.releaseYear}
              </span>
              {displayData.seasons && (
                <span className="flex items-center gap-1 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                  {displayData.seasons} Seasons
                </span>
              )}
            </div>
            {displayData.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {displayData.genres.map((g) => (
                  <span key={g} className="text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 px-2.5 py-1 rounded text-white/70">
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Overview */}
        {displayData.overview && (
          <p className="mt-5 text-sm text-gray-400 leading-relaxed font-normal">
            {displayData.overview}
          </p>
        )}

        <div className="flex items-center gap-3 mt-8">
          {/* Main YouTube Button */}
          {displayData.trailerLink?.key && (
            <a
              href={`https://www.youtube.com/watch?v=${displayData.trailerLink.key}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 active:scale-[0.98]"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              Buka di YouTube
            </a>
          )}

          {/* Favorite */}
          <button
            onClick={handleFavorite}
            className={`w-11 h-11 flex-shrink-0 rounded-xl border flex items-center justify-center text-lg transition-all active:scale-[0.98] ${
              isFav
                ? 'bg-red-600/10 border-red-600/50 text-red-600 shadow-inner'
                : 'bg-white/5 border-white/10 text-white/40 hover:text-white/80 hover:border-white/20'
            }`}
          >
            {isFav ? '❤️' : '🤍'}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="px-5 h-11 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-sm font-bold transition-all active:scale-[0.98]"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TvModal;
