import { useDraggableScroll } from '../../hooks/useDraggableScroll';

const CastRow = ({ cast }) => {
  const scrollRef = useDraggableScroll();

  if (!cast || cast.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-white mb-4">Pemeran Film</h3>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x cursor-grab active:cursor-grabbing select-none"
      >
        {cast.map((actor) => (
          <div
            key={actor.id}
            className="flex-none w-32 bg-[#1a1c29] rounded-xl overflow-hidden border border-white/5 shadow-lg snap-start group"
          >
            <div className="w-full h-44 bg-gray-800 relative overflow-hidden">
              {actor.profilePath ? (
                <img
                  src={actor.profilePath}
                  alt={actor.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <svg className="w-12 h-12 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="p-3">
              <h4 className="text-white text-sm font-bold line-clamp-1">{actor.name}</h4>
              <p className="text-gray-400 text-xs mt-1 line-clamp-2">{actor.character || 'Unknown Role'}</p>
              {actor.episodeCount && (
                <p className="text-gray-500 text-[10px] mt-1">{actor.episodeCount} Episode</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CastRow;
