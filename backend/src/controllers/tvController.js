const axios = require('axios');
const cache = require('../config/cache');
const { mapTvData } = require('../utils/tvHelpers');

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_KEY  = process.env.TMDB_API_KEY;

const getTrendingTv = async (req, res, next) => {
  const cacheKey = 'tv:trending';
  try {
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, source: 'cache', data: cached });

    const { data } = await axios.get(`${TMDB_BASE}/trending/tv/week`, {
      params: { api_key: TMDB_KEY, language: 'id-ID' },
    });

    const shows = data.results.map(s => mapTvData(s));
    cache.set(cacheKey, shows);

    res.json({ success: true, source: 'api', data: shows });
  } catch (error) { next(error); }
};

const getPopularTv = async (req, res, next) => {
  const { page = 1 } = req.query;
  const cacheKey = `tv:popular:page${page}`;
  try {
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, source: 'cache', data: cached });

    const { data } = await axios.get(`${TMDB_BASE}/tv/popular`, {
      params: { api_key: TMDB_KEY, language: 'id-ID', page },
    });

    const shows = data.results.map(s => mapTvData(s));
    cache.set(cacheKey, shows);

    res.json({ success: true, source: 'api', data: shows });
  } catch (error) { next(error); }
};

const getTvDetail = async (req, res, next) => {
  const { id } = req.params;
  const cacheKey = `tv:detail:${id}`;
  try {
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, source: 'cache', data: cached });

    const { data } = await axios.get(`${TMDB_BASE}/tv/${id}`, {
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

    const mapped      = mapTvData(data, data['watch/providers'], trailer?.key);

    cache.set(cacheKey, mapped, 21600);

    res.json({ success: true, source: 'api', data: mapped });
  } catch (error) {
    if (error.response?.status === 404) {
      error.statusCode = 404;
      error.message    = `Serial TV dengan ID ${id} tidak ditemukan`;
    }
    next(error);
  }
};

const searchTv = async (req, res, next) => {
  const { q, page = 1 } = req.query;
  if (!q || q.trim().length < 2)
    return res.status(400).json({ success: false, message: 'Query minimal 2 karakter' });

  try {
    const { data } = await axios.get(`${TMDB_BASE}/search/tv`, {
      params: { api_key: TMDB_KEY, language: 'id-ID', query: q, page },
    });

    res.json({
      success: true,
      data: data.results.map(s => mapTvData(s)),
      meta: {
        page:         data.page,
        totalPages:   data.total_pages,
        totalResults: data.total_results,
      },
    });
  } catch (error) { next(error); }
};

module.exports = { getTrendingTv, getPopularTv, getTvDetail, searchTv };
