import { useRef } from 'react';
import BookCard from './BookCard';

const BookRow = ({ title, books, onBookClick }) => {
  const rowRef = useRef(null);

  const scroll = (dir) => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: dir * 600, behavior: 'smooth' });
    }
  };

  if (!books?.length) return null;

  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-white mb-4 px-6">{title}</h2>
      <div className="relative group">
        <button
          onClick={() => scroll(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ‹
        </button>

        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto scroll-hide px-6 pb-2"
        >
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onClick={onBookClick}
            />
          ))}
        </div>

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

export default BookRow;