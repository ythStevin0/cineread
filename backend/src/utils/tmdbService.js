const axios = require('axios');
const cache = require('../config/cache');

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_KEY  = process.env.TMDB_API_KEY;

const fetchFromTmdb = async (endpoint, params = {}, cacheKey, cacheTime = 3600) => {
  if (cacheKey) {
    const cached = cache.get(cacheKey);
    if (cached) return { data: cached, source: 'cache' };
  }

  const { data } = await axios.get(`${TMDB_BASE}${endpoint}`, {
    params: { api_key: TMDB_KEY, language: 'id-ID', ...params },
  });

  if (cacheKey) cache.set(cacheKey, data, cacheTime);
  return { data, source: 'api' };
};

module.exports = { fetchFromTmdb, TMDB_BASE, TMDB_KEY };
