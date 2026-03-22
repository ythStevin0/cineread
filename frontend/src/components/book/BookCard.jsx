import StarRating from '../ui/StarRating';

const BookCard = ({ book, onClick }) => (
  <div
    className="flex-shrink-0 w-32 cursor-pointer group"
    onClick={() => onClick(book)}
  >
    <div className="relative rounded-xl overflow-hidden bg-surface aspect-[2/3]">
      {book.cover ? (
        <img
          src={book.cover}
          alt={book.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
      )}
    </div>
    <div className="mt-2 px-1">
      <p className="text-xs text-white font-medium truncate">{book.title}</p>
      <p className="text-xs text-gray-500 truncate">{book.authors?.[0]}</p>
      <div className="mt-1">
        <StarRating rating={book.rating} />
      </div>
    </div>
  </div>
);

export default BookCard;