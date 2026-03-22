import { useRef } from 'react';
import MovieCard from './MovieCard';

const MovieRow = ({ title, movies, onMovieClick }) => {
  const rowRef = useRef(null);

  const scroll = (dir) => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: dir * 600, behavior: 'smooth' });
    }
  };

  if (!movies?.length) return null;

  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-white mb-4 px-6">{title}</h2>
      <div className="relative group">
        {/* Scroll Left */}
        <button
          onClick={() => scroll(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ‹
        </button>

        {/* Cards */}
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto scroll-hide px-6 pb-2"
        >
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onClick={onMovieClick}
            />
          ))}
        </div>

        {/* Scroll Right */}
        <button
          onClick={() => scroll(1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default MovieRow;