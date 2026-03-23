import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { searchMovies } from '../../api/movieApi';
import { searchBooks } from '../../api/bookApi';
import { searchTv } from '../../api/tvApi';

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
      const [moviesRes, tvRes, booksRes] = await Promise.all([
        searchMovies(query),
        searchTv(query),
        searchBooks(query),
      ]);
      onSearchResults?.({
        query,
        movies: moviesRes.data.data,
        tv:     tvRes.data.data,
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
              placeholder="Cari film, serial TV, atau buku..."
              className="w-full bg-surface border border-border rounded-full px-5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors pr-11"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-accent transition-colors w-6 h-6 flex items-center justify-center"
            >
              {loading ? (
                /* Spinning loader */
                <svg className="animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                /* Search icon */
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              )}
            </button>
          </div>
        </form>

        {/* Auth */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {user ? (
            <>
              <Link to="/favorites" className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors">
                {/* Heart icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span className="hidden sm:inline">Favorit</span>
              </Link>
              <Link to="/history" className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors">
                {/* Clock icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span className="hidden sm:inline">History</span>
              </Link>
              <span className="text-sm text-gray-400 hidden md:inline">Hi, {user.username}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm bg-surface border border-border px-3 py-1.5 rounded-full hover:border-accent transition-colors"
              >
                {/* Logout icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors">
                {/* User icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 text-sm bg-accent px-4 py-1.5 rounded-full hover:bg-red-700 transition-colors"
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