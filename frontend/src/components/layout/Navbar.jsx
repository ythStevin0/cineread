import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { searchMovies } from '../../api/movieApi';
import { searchBooks } from '../../api/bookApi';

const Navbar = ({ onSearchResults }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [query, setQuery]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim() || query.trim().length < 2) return;
    setLoading(true);
    try {
      const [moviesRes, booksRes] = await Promise.all([
        searchMovies(query),
        searchBooks(query),
      ]);
      onSearchResults?.({
        query,
        movies: moviesRes.data.data,
        books:  booksRes.data.data,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-white flex-shrink-0">
          Cine<span className="text-accent">Read</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari film atau buku..."
              className="w-full bg-surface border border-border rounded-full px-5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-accent transition-colors"
            >
              {loading ? '⏳' : '🔍'}
            </button>
          </div>
        </form>

        {/* Auth */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {user ? (
            <>
              <Link to="/favorites" className="text-sm text-gray-300 hover:text-white transition-colors">
                ❤️ Favorit
              </Link>
              <Link to="/history" className="text-sm text-gray-300 hover:text-white transition-colors">
                🕐 History
              </Link>
              <span className="text-sm text-gray-400">Hi, {user.username}</span>
              <button
                onClick={handleLogout}
                className="text-sm bg-surface border border-border px-3 py-1 rounded-full hover:border-accent transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-accent px-4 py-1.5 rounded-full hover:bg-red-700 transition-colors"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;