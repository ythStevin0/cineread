import { useState, useEffect } from 'react';
import { getFavorites } from '../api/authApi';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Navbar from '../components/layout/Navbar';
import MovieModal from '../components/movie/MovieModal';
import TvModal from '../components/tv/TvModal';
import BookModal from '../components/book/BookModal';
import { Link } from 'react-router-dom';

const TYPE_LABEL = {
  movie: '🎬 Film',
  tv:    '📺 Serial TV',
  book:  '📚 Buku',
};

const Favorites = () => {
  const [favorites,     setFavorites]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedTv,    setSelectedTv]    = useState(null);
  const [selectedBook,  setSelectedBook]  = useState(null);

  useEffect(() => {
    getFavorites()
      .then((res) => setFavorites(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleItemClick = (item) => {
    if (item.itemType === 'movie') {
      import('../api/movieApi').then(({ getMovieDetail }) => {
        getMovieDetail(item.itemId)
          .then((res) => setSelectedMovie(res.data.data))
          .catch(() => setSelectedMovie({ id: item.itemId, title: item.title, poster: item.poster }));
      });
    } else if (item.itemType === 'tv') {
      import('../api/tvApi').then(({ getTvDetail }) => {
        getTvDetail(item.itemId)
          .then((res) => setSelectedTv(res.data.data))
          .catch(() => setSelectedTv({ id: item.itemId, title: item.title, poster: item.poster }));
      });
    } else if (item.itemType === 'book') {
      import('../api/bookApi').then(({ getBookDetail }) => {
        getBookDetail(item.itemId)
          .then((res) => setSelectedBook(res.data.data))
          .catch(() => setSelectedBook({ id: item.itemId, title: item.title, poster: item.poster }));
      });
    }
  };

  return (
    <div className="min-h-screen bg-dark">
      <Navbar onSearchResults={() => {}} />

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" className="text-accent">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              Favorit Saya
            </h1>
            <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← Kembali
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : favorites.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 mx-auto mb-4 opacity-40">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <p className="text-lg">Belum ada favorit.</p>
              <p className="text-sm mt-1">Tambahkan dari halaman utama!</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6">{favorites.length} item favorit</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {favorites.map((item) => (
                  <div
                    key={item._id}
                    className="cursor-pointer group"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="relative rounded-xl overflow-hidden bg-surface aspect-[2/3]">
                      {item.poster ? (
                        <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          {item.itemType === 'movie' ? '🎬' : item.itemType === 'tv' ? '📺' : '📚'}
                        </div>
                      )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">▶ Buka</span>
                        </div>
                    </div>
                    <p className="text-xs text-white mt-2 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500">{TYPE_LABEL[item.itemType] || item.itemType}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <MovieModal
        movie={selectedMovie}
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
      <TvModal
        show={selectedTv}
        isOpen={!!selectedTv}
        onClose={() => setSelectedTv(null)}
      />
      <BookModal
        book={selectedBook}
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
      />
    </div>
  );
};

export default Favorites;