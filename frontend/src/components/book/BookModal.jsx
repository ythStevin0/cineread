import Modal from '../ui/Modal';
import useAuthStore from '../../store/authStore';
import useAppStore from '../../store/appStore';
import { addFavorite, removeFavorite, addHistory } from '../../api/authApi';
import { useEffect } from 'react';

const BookModal = ({ book, isOpen, onClose }) => {
  const { user }    = useAuthStore();
  const { favorites, addFavorite: addFav, removeFavorite: removeFav } = useAppStore();

  const isFav = favorites.some(
    (f) => f.itemId === String(book?.id) && f.itemType === 'book'
  );

  useEffect(() => {
    if (isOpen && book && user) {
      addHistory({
        itemId:   String(book.id),
        itemType: 'book',
        title:    book.title,
        poster:   book.cover,
      }).catch(() => {});
    }
  }, [isOpen, book, user]);

  const handleFavorite = async () => {
    if (!user) return alert('Login dulu untuk menyimpan favorit!');
    try {
      if (isFav) {
        await removeFavorite(book.id, 'book');
        removeFav(String(book.id), 'book');
      } else {
        await addFavorite({
          itemId:   String(book.id),
          itemType: 'book',
          title:    book.title,
          poster:   book.cover,
          rating:   String(book.rating),
        });
        addFav({ itemId: String(book.id), itemType: 'book', title: book.title, poster: book.cover });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!book) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex gap-4">
          {book.cover && (
            <img
              src={book.coverLarge || book.cover}
              alt={book.title}
              className="w-28 h-40 object-cover rounded-lg flex-shrink-0 shadow-xl"
            />
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white leading-tight">{book.title}</h2>
            <p className="text-sm text-gray-400 mt-1">{book.authors?.join(', ')}</p>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-400 flex-wrap">
              {book.rating && <span>⭐ {book.rating}</span>}
              <span>📅 {book.publishedYear}</span>
              {book.pageCount && <span>📄 {book.pageCount} hal</span>}
            </div>
            {book.categories?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {book.categories.slice(0, 3).map((c) => (
                  <span key={c} className="text-xs bg-surface border border-border px-2 py-0.5 rounded-full text-gray-300">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {book.description && (
          <p className="mt-4 text-sm text-gray-300 leading-relaxed line-clamp-4">
            {book.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6 flex-wrap">
{book.links?.readOnline && (
            <a
              href={book.links.readOnline}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-accent hover:bg-red-700 text-white text-sm font-semibold py-2.5 rounded-xl text-center transition-colors"
            >
              📖 Baca Online
            </a>
          )}
{book.links?.buyLinks?.gramedia && (
            <a
              href={book.links.buyLinks.gramedia}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-surface border border-border hover:border-accent text-white text-sm font-semibold py-2.5 rounded-xl text-center transition-colors"
            >
              🛒 Gramedia
            </a>
          )}
          {book.links?.buyLinks?.tokopedia && (
            <a
              href={book.links.buyLinks.tokopedia}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-surface border border-border hover:border-accent text-white text-sm font-semibold py-2.5 rounded-xl text-center transition-colors"
            >
              🛒 Tokopedia
            </a>
          )}
          <button
            onClick={handleFavorite}
            className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
              isFav
                ? 'bg-accent border-accent text-white'
                : 'border-border text-gray-300 hover:border-accent'
            }`}
          >
            {isFav ? '❤️' : '🤍'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-border text-gray-400 hover:text-white text-sm transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BookModal;