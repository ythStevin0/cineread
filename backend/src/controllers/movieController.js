const axios = require('axios');
const cache = require('../config/cache');

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_KEY  = process.env.TMDB_API_KEY;
const TMDB_IMG  = 'https://image.tmdb.org/t/p/w500';

const PROVIDER_IDS = { netflix: 8, disneyPlus: 337 };

const resolveStreamingLink = (providersData, movieTitle) => {
  const regions = ['ID', 'US'];

  for (const region of regions) {
    const regionData = providersData?.results?.[region];
    if (!regionData) continue;

    const allProviders = [
      ...(regionData.flatrate || []),
      ...(regionData.rent     || []),
      ...(regionData.buy      || []),
    ];

    const hasNetflix = allProviders.some(p => p.provider_id === PROVIDER_IDS.netflix);
    const hasDisney  = allProviders.some(p => p.provider_id === PROVIDER_IDS.disneyPlus);

    if (hasNetflix) return { platform: 'Netflix',  url: regionData.link, icon: 'netflix' };
    if (hasDisney)  return { platform: 'Disney+',  url: regionData.link, icon: 'disney'  };
  }

  const searchQuery = encodeURIComponent(movieTitle);
  return {
    platform: 'Google Play Movies',
    url: `https://play.google.com/store/search?q=${searchQuery}&c=movies`,
    icon: 'googleplay',
  };
};

const mapMovieData = (movie, providersData = null) => ({
  id:            movie.id,
  title:         movie.title,
  overview:      movie.overview,
  poster:        movie.poster_path ? `${TMDB_IMG}${movie.poster_path}` : null,
  backdrop:      movie.backdrop_path
                   ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
                   : null,
  rating:        movie.vote_average?.toFixed(1),
  releaseYear:   movie.release_date?.split('-')[0] || 'N/A',
  genres:        movie.genres?.map(g => g.name) || [],
  runtime:       movie.runtime ? `${movie.runtime} min` : null,
  trailerKey:    null,
  streamingLink: providersData
                   ? resolveStreamingLink(providersData, movie.title)
                   : null,
});

const getTrendingMovies = async (req, res, next) => {
  const cacheKey = 'movies:trending';
  try {
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, source: 'cache', data: cached });

    const { data } = await axios.get(`${TMDB_BASE}/trending/movie/week`, {
      params: { api_key: TMDB_KEY, language: 'id-ID' },
    });

    const movies = data.results.map(m => mapMovieData(m));
    cache.set(cacheKey, movies);

    res.json({ success: true, source: 'api', data: movies });
  } catch (error) { next(error); }
};

const getPopularMovies = async (req, res, next) => {
  const { page = 1 } = req.query;
  const cacheKey = `movies:popular:page${page}`;
  try {
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, source: 'cache', data: cached });

    const { data } = await axios.get(`${TMDB_BASE}/movie/popular`, {
      params: { api_key: TMDB_KEY, language: 'id-ID', page },
    });

    const movies = data.results.map(m => mapMovieData(m));
    cache.set(cacheKey, movies);

    res.json({ success: true, source: 'api', data: movies });
  } catch (error) { next(error); }
};

const getMovieDetail = async (req, res, next) => {
  const { id } = req.params;
  const cacheKey = `movies:detail:${id}`;
  try {
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, source: 'cache', data: cached });

    const { data } = await axios.get(`${TMDB_BASE}/movie/${id}`, {
      params: {
        api_key: TMDB_KEY,
        language: 'id-ID',
        append_to_response: 'videos,watch/providers',
      },
    });

    const videos  = data.videos?.results || [];
    const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official)
                 || videos.find(v => v.type === 'Trailer' && v.site === 'YouTube')
                 || null;

    const mapped      = mapMovieData(data, data['watch/providers']);
    mapped.trailerKey = trailer?.key || null;

    cache.set(cacheKey, mapped, 21600);

    res.json({ success: true, source: 'api', data: mapped });
  } catch (error) {
    if (error.response?.status === 404) {
      error.statusCode = 404;
      error.message    = `Film dengan ID ${id} tidak ditemukan`;
    }
    next(error);
  }
};

const searchMovies = async (req, res, next) => {
  const { q, page = 1 } = req.query;
  if (!q || q.trim().length < 2)
    return res.status(400).json({ success: false, message: 'Query minimal 2 karakter' });

  try {
    const { data } = await axios.get(`${TMDB_BASE}/search/movie`, {
      params: { api_key: TMDB_KEY, language: 'id-ID', query: q, page },
    });

    res.json({
      success: true,
      data: data.results.map(m => mapMovieData(m)),
      meta: {
        page:         data.page,
        totalPages:   data.total_pages,
        totalResults: data.total_results,
      },
    });
  } catch (error) { next(error); }
};

module.exports = { getTrendingMovies, getPopularMovies, getMovieDetail, searchMovies };