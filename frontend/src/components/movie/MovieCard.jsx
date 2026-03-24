import StarRating from '../ui/StarRating';

const MovieCard = ({ movie, onClick }) => (
  <div
    className="flex-shrink-0 w-36 cursor-pointer group/card transition-colors duration-300"
    onClick={() => onClick(movie)}
  >
    <div className="relative rounded-xl overflow-hidden bg-surface aspect-[2/3] border-2 border-transparent group-hover/card:border-accent transition-colors duration-300 shadow-lg group-hover/card:shadow-accent/40">
      {movie.poster ? (
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-4xl">🎬</div>
      )}
      {/* Overlay gradient and buttons */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-col justify-end p-3 gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onClick(movie, 'movie'); }}
          className="w-full bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors"
        >
          ▶ Nonton
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onClick(movie, 'trailer'); }}
          className="w-full bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors backdrop-blur-sm"
        >
          🎬 Trailer
        </button>
      </div>
    </div>
    <div className="mt-2 px-1">
      <p className="text-xs text-white font-medium truncate">{movie.title}</p>
      <div className="flex items-center justify-between mt-1">
        <StarRating rating={movie.rating} />
        <span className="text-xs text-gray-500">{movie.releaseYear}</span>
      </div>
    </div>
  </div>
);

export default MovieCard;