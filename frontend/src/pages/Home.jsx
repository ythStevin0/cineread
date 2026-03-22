import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import MovieRow from '../components/movie/MovieRow';
import BookRow from '../components/book/BookRow';
import MovieModal from '../components/movie/MovieModal';
import BookModal from '../components/book/BookModal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getTrendingMovies, getPopularMovies } from '../api/movieApi';
import { getFeaturedBooks, getPopularBooks } from '../api/bookApi';
import { getFavorites } from '../api/authApi';
import useAuthStore from '../store/authStore';
import useAppStore from '../store/appStore';

const Home = () => {
  const { user }         = useAuthStore();
  const { setFavorites } = useAppStore();

  const [trending,  setTrending]  = useState([]);
  const [popular,   setPopular]   = useState([]);
  const [featured,  setFeatured]  = useState([]);
  const [popBooks,  setPopBooks]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState(null);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedBook,  setSelectedBook]  = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [t, p, f, b] = await Promise.all([
          getTrendingMovies(),
          getPopularMovies(),
          getFeaturedBooks(),
          getPopularBooks(),
        ]);
        setTrending(t.data.data);
        setPopular(p.data.data);
        setFeatured(f.data.data);
        setPopBooks(b.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Load favorites kalau user login
  useEffect(() => {
    if (user) {
      getFavorites()
        .then((res) => setFavorites(res.data.data))
        .catch(() => {});
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-dark">
      <Navbar onSearchResults={setSearch} />

      <main className="pt-24 pb-16">
        {loading ? (
          <LoadingSpinner />
        ) : search ? (
          // Hasil Search
          <div className="px-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Hasil pencarian: <span className="text-accent">"{search.query}"</span>
              </h2>
              <button
                onClick={() => setSearch(null)}
                className="text-sm text-gray-400 hover:text-white border border-border px-3 py-1 rounded-full transition-colors"
              >
                ✕ Hapus pencarian
              </button>
            </div>

            {search.movies?.length > 0 && (
              <MovieRow
                title={`Film (${search.movies.length})`}
                movies={search.movies}
                onMovieClick={setSelectedMovie}
              />
            )}
            {search.books?.length > 0 && (
              <BookRow
                title={`Buku (${search.books.length})`}
                books={search.books}
                onBookClick={setSelectedBook}
              />
            )}
            {!search.movies?.length && !search.books?.length && (
              <p className="text-gray-500 text-center py-20">Tidak ada hasil ditemukan</p>
            )}
          </div>
        ) : (
          // Halaman Utama
          <div>
            {/* Hero */}
            <div className="px-6 mb-10">
              <h1 className="text-4xl font-bold text-white">
                Selamat Datang di <span className="text-accent">CineRead</span>
              </h1>
              <p className="text-gray-400 mt-2">
                Temukan film & buku terbaik untuk hari ini
              </p>
            </div>

            <MovieRow title="🔥 Trending Minggu Ini"  movies={trending} onMovieClick={setSelectedMovie} />
            <MovieRow title="🎬 Film Popular"          movies={popular}  onMovieClick={setSelectedMovie} />
            <BookRow  title="📚 Buku Unggulan"         books={featured}  onBookClick={setSelectedBook}  />
            <BookRow  title="🌟 Buku Popular"          books={popBooks}  onBookClick={setSelectedBook}  />
          </div>
        )}
      </main>

      {/* Modals */}
      <MovieModal
        movie={selectedMovie}
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
      <BookModal
        book={selectedBook}
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
      />
    </div>
  );
};

export default Home;