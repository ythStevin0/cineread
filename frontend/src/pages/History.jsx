import { useState, useEffect } from 'react';
import { getHistory } from '../api/authApi';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Navbar from '../components/layout/Navbar';
import MovieModal from '../components/movie/MovieModal';
import TvModal from '../components/tv/TvModal';
import BookModal from '../components/book/BookModal';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';

const TYPE_LABEL = {
  movie: '🎬 Film',
  tv:    '📺 Serial TV',
  book:  '📚 Buku',
};

const History = () => {
  const [history,       setHistory]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [clearing,      setClearing]      = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedTv,    setSelectedTv]    = useState(null);
  const [selectedBook,  setSelectedBook]  = useState(null);

  const fetchHistory = () => {
    setLoading(true);
    getHistory()
      .then((res) => setHistory(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleClear = async () => {
    if (!window.confirm('Hapus semua riwayat?')) return;
    setClearing(true);
    try {
      await api.delete('/user/history');
      setHistory([]);
    } catch (err) {
      console.error(err);
    } finally {
      setClearing(false);
    }
  };

  // Buka modal sesuai tipe item
  const handleItemClick = (item) => {
    if (item.itemType === 'movie') {
      // Fetch detail biar streamingLink & trailerKey tersedia
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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Riwayat Tontonan
            </h1>
            <div className="flex items-center gap-3">
              {history.length > 0 && (
                <button
                  onClick={handleClear}
                  disabled={clearing}
                  className="text-sm text-red-400 hover:text-red-300 border border-red-800 hover:border-red-600 px-3 py-1.5 rounded-full transition-colors"
                >
                  {clearing ? 'Menghapus...' : 'Hapus Semua'}
                </button>
              )}
              <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                ← Kembali
              </Link>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : history.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 mx-auto mb-4 opacity-40">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <p className="text-lg">Belum ada riwayat.</p>
              <p className="text-sm mt-1">Mulai jelajahi film, serial TV &amp; buku!</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6">{history.length} item ditonton</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {history.map((item) => (
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
                      {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">▶ Buka</span>
                        </div>
                    </div>
                    <p className="text-xs text-white mt-2 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500">{TYPE_LABEL[item.itemType] || item.itemType}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">
                      {new Date(item.viewedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
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

export default History;