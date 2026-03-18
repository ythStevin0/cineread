const axios = require('axios');
const cache = require('../config/cache');

const GBOOKS_BASE = 'https://www.googleapis.com/books/v1';
const GBOOKS_KEY  = process.env.GOOGLE_BOOKS_API_KEY;

const resolveBookLinks = (volumeInfo) => {
  const title       = volumeInfo.title        || '';
  const author      = volumeInfo.authors?.[0] || '';
  const searchQuery = encodeURIComponent(`${title} ${author}`.trim());

  return {
    readOnline: volumeInfo.previewLink || null,
    buyLinks: {
      gramedia:  `https://www.gramedia.com/search/?q=${searchQuery}`,
      tokopedia: `https://www.tokopedia.com/search?st=product&q=${encodeURIComponent(title)}`,
    },
    isFullyReadable: volumeInfo.accessInfo?.viewability === 'ALL_PAGES',
  };
};

const mapBookData = (item) => {
  const v = item.volumeInfo || {};
  const s = item.saleInfo   || {};

  return {
    id:            item.id,
    title:         v.title   || 'Untitled',
    authors:       v.authors || ['Unknown Author'],
    description:   v.description || null,
    cover:         v.imageLinks?.large
                || v.imageLinks?.medium
                || v.imageLinks?.thumbnail?.replace('http://', 'https://')
                || null,
    publishedYear: v.publishedDate?.split('-')[0] || 'N/A',
    pageCount:     v.pageCount    || null,
    categories:    v.categories   || [],
    rating:        v.averageRating || null,
    ratingsCount:  v.ratingsCount  || 0,
    language:      v.language      || 'N/A',
    isbn:          v.industryIdentifiers?.find(i => i.type === 'ISBN_13')?.identifier
                || v.industryIdentifiers?.find(i => i.type === 'ISBN_10')?.identifier
                || null,
    price:         s.retailPrice
                   ? { amount: s.retailPrice.amount, currency: s.retailPrice.currencyCode }
                   : null,
    links:         resolveBookLinks(v),
  };
};

const getFeaturedBooks = async (req, res, next) => {
  const cacheKey = 'books:featured';
  try {
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, source: 'cache', data: cached });

    const { data } = await axios.get(`${GBOOKS_BASE}/volumes`, {
      params: {
        key:         GBOOKS_KEY,
        q:           'subject:fiction bestseller',
        orderBy:     'relevance',
        maxResults:  20,
        langRestrict:'id',
        printType:   'books',
      },
    });

    const books = (data.items || []).map(mapBookData);
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

    const { data } = await axios.get(`${GBOOKS_BASE}/volumes/${id}`, {
      params: { key: GBOOKS_KEY },
    });

    const book = mapBookData(data);
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
  const { q, page = 0 } = req.query;
  if (!q || q.trim().length < 2)
    return res.status(400).json({ success: false, message: 'Query minimal 2 karakter' });

  try {
    const { data } = await axios.get(`${GBOOKS_BASE}/volumes`, {
      params: {
        key:        GBOOKS_KEY,
        q:          q.trim(),
        maxResults: 20,
        startIndex: parseInt(page) * 20,
        printType:  'books',
        orderBy:    'relevance',
      },
    });

    res.json({
      success: true,
      data:    (data.items || []).map(mapBookData),
      meta: {
        page:         parseInt(page),
        totalResults: data.totalItems || 0,
      },
    });
  } catch (error) { next(error); }
};

module.exports = { getFeaturedBooks, getBookDetail, searchBooks };