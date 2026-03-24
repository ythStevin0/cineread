const { fetchFromTmdb } = require('../utils/tmdbService');
const { mapMovieData } = require('../utils/movieHelpers');

const getTrendingMovies = async (req, res, next) => {
  try {
    const { data } = await fetchFromTmdb('/trending/movie/week', {}, 'movies:trending');
    const movies = data.results.map(m => mapMovieData(m));
    res.json({ success: true, data: movies });
  } catch (error) { next(error); }
};

const getPopularMovies = async (req, res, next) => {
  const { page = 1 } = req.query;
  try {
    const { data } = await fetchFromTmdb('/movie/popular', { page }, `movies:popular:page${page}`);
    const movies = data.results.map(m => mapMovieData(m));
    res.json({ success: true, data: movies });
  } catch (error) { next(error); }
};

const getMovieDetail = async (req, res, next) => {
  const { id } = req.params;
  try {
    const { data } = await fetchFromTmdb(`/movie/${id}`, { append_to_response: 'videos,watch/providers' }, `movies:detail:${id}`, 21600);
    const videos = data.videos?.results || [];
    const mapped = mapMovieData(data, data['watch/providers'], videos);
    res.json({ success: true, data: mapped });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ success: false, message: `Film dengan ID ${id} tidak ditemukan` });
    }
    next(error);
  }
};

const searchMovies = async (req, res, next) => {
  const { q, page = 1 } = req.query;
  if (!q || q.trim().length < 2)
    return res.status(400).json({ success: false, message: 'Query minimal 2 karakter' });

  try {
    const { data } = await fetchFromTmdb('/search/movie', { query: q, page });
    res.json({
      success: true,
      data: data.results.map(m => mapMovieData(m)),
      meta: { page: data.page, totalPages: data.total_pages, totalResults: data.total_results },
    });
  } catch (error) { next(error); }
};

module.exports = { getTrendingMovies, getPopularMovies, getMovieDetail, searchMovies };
