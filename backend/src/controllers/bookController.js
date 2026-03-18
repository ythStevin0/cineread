const axios  = require('axios');
const cache  = require('../config/cache');
const { mapBookFromSearch, mapBookFromDetail } = require('../utils/bookHelpers');

const OL_BASE   = 'https://openlibrary.org';
const OL_SEARCH = `${OL_BASE}/search.json`;
const FIELDS    = 'key,title,author_name,cover_i,first_publish_year,ratings_average,ratings_count,number_of_pages_median,subject,language,isbn,public_scan_b,first_sentence';

const getFeaturedBooks = async (req, res, next) => {
  const cacheKey = 'books:featured';
  try {
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, source: 'cache', data: cached });

    const { data } = await axios.get(OL_SEARCH, {
      params: { q: 'subject:fiction', sort: 'rating', limit: 20, lang: 'ind', fields: FIELDS },
    });

    const books = (data.docs || []).map(mapBookFromSearch);
    cache.set(cacheKey, books, 7200);
    res.json({ success: true, source: 'api', data: books });
  } catch (error) { next(error); }
};

const getPopularBooks = async (req, res, next) => {
  const cacheKey = 'books:popular';
  try {
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, source: 'cache', data: cached });

    const { data } = await axios.get(OL_SEARCH, {
      params: { q: 'subject:bestseller', sort: 'rating', limit: 20, fields: FIELDS },
    });

    const books = (data.docs || []).map(mapBookFromSearch);
    cache.set(cacheKey, books, 7200);
    res.json({ success: true, source: 'api', data: books });
  } catch (error) { next(error); }
};

const getBookDetail = async (req, res, next) => {
  const { id } = req.params;
  const cacheKey = `books:detail:${id}`;
  try {
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, source: 'cache', data: cached });

    const [workRes, editionsRes] = await Promise.all([
      axios.get(`${OL_BASE}/works/${id}.json`),
      axios.get(`${OL_BASE}/works/${id}/editions.json?limit=1`),
    ]);

    const book = mapBookFromDetail(workRes.data, editionsRes.data?.entries || []);
    cache.set(cacheKey, book, 43200);
    res.json({ success: true, source: 'api', data: book });
  } catch (error) {
    if (error.response?.status === 404) {
      error.statusCode = 404;
      error.message    = `Buku dengan ID ${id} tidak ditemukan`;
    }
    next(error);
  }
};

const searchBooks = async (req, res, next) => {
  const { q, page = 1 } = req.query;
  if (!q || q.trim().length < 2)
    return res.status(400).json({ success: false, message: 'Query minimal 2 karakter' });

  try {
    const { data } = await axios.get(OL_SEARCH, {
      params: { q: q.trim(), limit: 20, offset: (parseInt(page) - 1) * 20, fields: FIELDS },
    });

    res.json({
      success: true,
      data:    (data.docs || []).map(mapBookFromSearch),
      meta:    { page: parseInt(page), totalResults: data.numFound || 0 },
    });
  } catch (error) { next(error); }
};

module.exports = { getFeaturedBooks, getPopularBooks, getBookDetail, searchBooks };