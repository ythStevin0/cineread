import { useState, useEffect } from 'react';
import MovieCard from '../movie/MovieCard';
import TvCard from '../tv/TvCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import { getRecommendations } from '../../api/recommendApi';
import useAuthStore from '../../store/authStore';
import useDraggableScroll from '../../hooks/useDraggableScroll';

/**
 * Section "🤖 Rekomendasi untuk Kamu" di halaman Home.
 * Hanya muncul jika user sudah login dan punya history.
 */
const RecommendationSection = ({ onMovieClick, onTvClick }) => {
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('');
  const [message, setMessage] = useState('');
  
  const { ref: rowRef, events, isDragging } = useDraggableScroll();
  
  const scroll = (dir) => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: dir * 600, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const fetchRecs = async () => {
      setLoading(true);
      try {
        const res = await getRecommendations();
        if (isMounted) {
          setItems(res.data?.data || []);
          setSource(res.data?.source || '');
          setMessage(res.data?.message || '');
        }
      } catch {
        // ignore
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRecs();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Jangan render jika user belum login
  if (!user) return null;

  // Jangan render jika loading selesai tapi tidak ada item
  if (!loading && items.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4 px-6">
        {/* AI Icon */}
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="14"
            height="14"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">Rekomendasi untuk Kamu</h2>

        {/* Badge sumber rekomendasi */}
        {source && (
          <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
            {source === 'ai-hybrid' ? '🤖 AI' : '📊 TMDB'}
          </span>
        )}
      </div>

      {/* Subtitle/message */}
      {message && (
        <p className="text-xs text-gray-500 px-6 -mt-2 mb-3">{message}</p>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="relative group">
          {/* Scroll Left */}
          <button
            onClick={() => scroll(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ‹
          </button>

          <div 
            ref={rowRef}
            {...events}
            className={`flex gap-4 overflow-x-auto scroll-hide px-6 pb-2 select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {items.map((item) => {
              // Deteksi apakah ini TV (punya property 'firstAirYear' atau 'name')
              const isTv = item.firstAirYear || item.mediaType === 'tv';
              
              if (isTv) {
                return (
                  <TvCard
                    key={`rec-tv-${item.id}`}
                    show={item}
                    onClick={onTvClick}
                  />
                );
              }

              return (
                <MovieCard
                  key={`rec-movie-${item.id}`}
                  movie={item}
                  onClick={onMovieClick}
                />
              );
            })}
          </div>

          {/* Scroll Right */}
          <button
            onClick={() => scroll(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
};

export default RecommendationSection;
