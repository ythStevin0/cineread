import { useState, useEffect } from 'react';
import { getSimilarItems } from '../../api/recommendApi';
import useDraggableScroll from '../../hooks/useDraggableScroll';

/**
 * Komponen "Film/Serial Serupa" yang ditampilkan di dalam Modal detail.
 * Mengambil data dari AI similarity atau fallback ke TMDB.
 */
const SimilarItems = ({ tmdbId, mediaType = 'movie', onItemClick }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { ref: rowRef, events, isDragging } = useDraggableScroll();

  useEffect(() => {
    if (!tmdbId) return;

    let isMounted = true;
    const fetchSimilar = async () => {
      setLoading(true);
      try {
        const res = await getSimilarItems(tmdbId, mediaType);
        if (isMounted) {
          setItems(res.data?.data?.slice(0, 6) || []);
        }
      } catch {
        // ignore
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSimilar();
    return () => { isMounted = false; };
  }, [tmdbId, mediaType]);

  if (loading) {
    return (
      <div className="mt-6 pt-5 border-t border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-bold text-white/80">🎯 {mediaType === 'tv' ? 'Serial' : 'Film'} Serupa</span>
        </div>
        <div className="flex gap-3 overflow-x-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-20 flex-shrink-0">
              <div className="aspect-[2/3] rounded-lg bg-white/5 animate-pulse" />
              <div className="mt-1 h-3 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="mt-6 pt-5 border-t border-white/5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-bold text-white/80">🎯 {mediaType === 'tv' ? 'Serial' : 'Film'} Serupa</span>
        {items[0]?.source === 'ai-hybrid' && (
          <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
            AI
          </span>
        )}
      </div>

      <div 
        ref={rowRef}
        {...events}
        className={`flex gap-3 overflow-x-auto scroll-hide pb-1 select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="w-20 flex-shrink-0 cursor-pointer group/similar"
            onClick={() => onItemClick && onItemClick(item)}
          >
            <div className="aspect-[2/3] rounded-lg overflow-hidden bg-white/5 border border-transparent group-hover/similar:border-accent transition-colors">
              {item.poster ? (
                <img
                  src={item.poster}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  {mediaType === 'tv' ? '📺' : '🎬'}
                </div>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-1 truncate group-hover/similar:text-white transition-colors">
              {item.title}
            </p>
            {item.rating && (
              <p className="text-[9px] text-yellow-500">⭐ {item.rating}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarItems;
