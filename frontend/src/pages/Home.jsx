import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import MovieRow from '../components/movie/MovieRow';
import TvRow from '../components/tv/TvRow';
import BookRow from '../components/book/BookRow';
import MovieModal from '../components/movie/MovieModal';
import TvModal from '../components/tv/TvModal';
import BookModal from '../components/book/BookModal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getTrendingMovies, getPopularMovies } from '../api/movieApi';
import { getTrendingTv, getPopularTv } from '../api/tvApi';
import { getFeaturedBooks, getPopularBooks } from '../api/bookApi';
import { getFavorites } from '../api/authApi';
import useAuthStore from '../store/authStore';
import useAppStore from '../store/appStore';

const Home = () => {
  const { user }         = useAuthStore();
  const { setFavorites } = useAppStore();

  const [trending,     setTrending]     = useState([]);
  const [popular,      setPopular]      = useState([]);
  const [trendingTv,   setTrendingTv]   = useState([]);
  const [popularTv,    setPopularTv]    = useState([]);
  const [featured,     setFeatured]     = useState([]);
  const [popBooks,     setPopBooks]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState(null);

  const [selectedMovie, setSelectedMovie] = useState(null); // { item, viewType }
  const [selectedTv,    setSelectedTv]    = useState(null);
  const [selectedBook,  setSelectedBook]  = useState(null);

  const handleMovieClick = (movie, viewType = 'movie') => {
    setSelectedMovie({ item: movie, viewType });
  };

  const handleTvClick = (show, viewType = 'show') => {
    setSelectedTv({ item: show, viewType });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [t, p, tt, tp, f, b] = await Promise.all([
          getTrendingMovies(),
          getPopularMovies(),
          getTrendingTv(),
          getPopularTv(),
          getFeaturedBooks(),
          getPopularBooks(),
        ]);
        setTrending(t.data.data);
        setPopular(p.data.data);
        setTrendingTv(tt.data.data);
        setPopularTv(tp.data.data);
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
  }, );

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
                title={`🎬 Film (${search.movies.length})`}
                movies={search.movies}
                onMovieClick={handleMovieClick}
              />
            )}
            {search.tv?.length > 0 && (
              <TvRow
                title={`📺 Serial TV (${search.tv.length})`}
                shows={search.tv}
                onShowClick={handleTvClick}
              />
            )}
            {search.books?.length > 0 && (
              <BookRow
                title={`📚 Buku (${search.books.length})`}
                books={search.books}
                onBookClick={setSelectedBook}
              />
            )}
            {!search.movies?.length && !search.tv?.length && !search.books?.length && (
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
                Temukan film, serial TV &amp; buku terbaik untuk hari ini
              </p>
            </div>
            {/* Trending Movies */}
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4 px-6">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" className="text-orange-500">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.5 3.5 6.5 1 1.5-1 4.5-1 4.5s2.5-1.5 3.5-3c1 1.5 1 4.5-1 6.5-1.38 1.38-3.62 1.38-5 0s-2-3-2-5z"/>
                </svg>
                <h2 className="text-xl font-bold text-white">Trending Film Minggu Ini</h2>
              </div>
              <MovieRow movies={trending} onMovieClick={handleMovieClick} />
            </section>

            {/* Popular Movies */}
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4 px-6">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" className="text-blue-500">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                  <line x1="7" y1="2" x2="7" y2="22"/>
                  <line x1="17" y1="2" x2="17" y2="22"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <line x1="2" y1="7" x2="7" y2="7"/>
                  <line x1="2" y1="17" x2="7" y2="17"/>
                  <line x1="17" y1="17" x2="22" y2="17"/>
                  <line x1="17" y1="7" x2="22" y2="7"/>
                </svg>
                <h2 className="text-xl font-bold text-white">Film Popular</h2>
              </div>
              <MovieRow movies={popular} onMovieClick={handleMovieClick} />
            </section>

            {/* Trending TV */}
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4 px-6">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" className="text-indigo-500">
                  <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
                  <polyline points="17 2 12 7 7 2"/>
                </svg>
                <h2 className="text-xl font-bold text-white">Trending Serial TV</h2>
              </div>
              <TvRow shows={trendingTv} onShowClick={handleTvClick} />
            </section>

            {/* Popular TV */}
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4 px-6">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" className="text-yellow-500">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <h2 className="text-xl font-bold text-white">Serial TV Popular</h2>
              </div>
              <TvRow shows={popularTv} onShowClick={handleTvClick} />
            </section>

            {/* Featured Books */}
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4 px-6">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" className="text-green-500">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                <h2 className="text-xl font-bold text-white">Buku Unggulan</h2>
              </div>
              <BookRow books={featured} onBookClick={setSelectedBook} />
            </section>

            {/* Popular Books */}
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4 px-6">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" className="text-teal-500">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                <h2 className="text-xl font-bold text-white">Buku Popular</h2>
              </div>
              <BookRow books={popBooks} onBookClick={setSelectedBook} />
            </section>
          </div>
        )}
      </main>

      {/* Modals */}
      <MovieModal
        movie={selectedMovie?.item}
        initialViewType={selectedMovie?.viewType}
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
      <TvModal
        show={selectedTv?.item}
        initialViewType={selectedTv?.viewType}
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

export default Home;