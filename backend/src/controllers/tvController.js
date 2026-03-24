const { fetchFromTmdb } = require('../utils/tmdbService');
const { mapTvData } = require('../utils/tvHelpers');

const getTrendingTv = async (req, res, next) => {
  try {
    const { data } = await fetchFromTmdb('/trending/tv/week', {}, 'tv:trending');
    const shows = data.results.map(s => mapTvData(s));
    res.json({ success: true, data: shows });
  } catch (error) { next(error); }
};

const getPopularTv = async (req, res, next) => {
  const { page = 1 } = req.query;
  try {
    const { data } = await fetchFromTmdb('/tv/popular', { page }, `tv:popular:page${page}`);
    const shows = data.results.map(s => mapTvData(s));
    res.json({ success: true, data: shows });
  } catch (error) { next(error); }
};

const getTvDetail = async (req, res, next) => {
  const { id } = req.params;
  try {
    const { data } = await fetchFromTmdb(`/tv/${id}`, { append_to_response: 'videos,watch/providers' }, `tv:detail:${id}`, 21600);
    const videos = data.videos?.results || [];
    const mapped = mapTvData(data, data['watch/providers'], videos);
    res.json({ success: true, data: mapped });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ success: false, message: `Serial TV dengan ID ${id} tidak ditemukan` });
    }
    next(error);
  }
};

const searchTv = async (req, res, next) => {
  const { q, page = 1 } = req.query;
  if (!q || q.trim().length < 2)
    return res.status(400).json({ success: false, message: 'Query minimal 2 karakter' });

  try {
    const { data } = await fetchFromTmdb('/search/tv', { query: q, page });
    res.json({
      success: true,
      data: data.results.map(s => mapTvData(s)),
      meta: { page: data.page, totalPages: data.total_pages, totalResults: data.total_results },
    });
  } catch (error) { next(error); }
};

module.exports = { getTrendingTv, getPopularTv, getTvDetail, searchTv };
