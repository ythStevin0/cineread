import { useState, useEffect } from 'react';
import { getFavorites } from '../api/authApi';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    getFavorites()
      .then((res) => setFavorites(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-dark pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">❤️ Favorit Saya</h1>
          <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Kembali
          </Link>
        </div>

        {loading ? <LoadingSpinner /> : favorites.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-5xl mb-4">🤍</p>
            <p>Belum ada favorit. Tambahkan dari halaman utama!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {favorites.map((item) => (
              <div key={item._id} className="group">
                <div className="rounded-xl overflow-hidden bg-surface aspect-[2/3]">
                  {item.poster ? (
                    <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      {item.itemType === 'movie' ? '🎬' : '📚'}
                    </div>
                  )}
                </div>
                <p className="text-xs text-white mt-2 truncate">{item.title}</p>
                <p className="text-xs text-gray-500 capitalize">{item.itemType}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;