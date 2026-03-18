const OL_BASE   = 'https://openlibrary.org';
const OL_COVERS = 'https://covers.openlibrary.org/b';

const buildCoverUrl = (coverId, size = 'M') => {
  if (!coverId) return null;
  return `${OL_COVERS}/id/${coverId}-${size}.jpg`;
};

const extractYear = (dateStr) => {
  if (!dateStr) return 'N/A';
  const match = String(dateStr).match(/\d{4}/);
  return match ? match[0] : 'N/A';
};

const resolveBookLinks = (doc) => {
  const title       = doc.title || '';
  const author      = doc.author_name?.[0] || '';
  const searchQuery = encodeURIComponent(`${title} ${author}`.trim());
  const olKey       = doc.key || doc.edition_key?.[0] || null;

  return {
    readOnline: olKey ? `${OL_BASE}${olKey}` : null,
    buyLinks: {
      gramedia:  `https://www.gramedia.com/search/?q=${searchQuery}`,
      tokopedia: `https://www.tokopedia.com/search?st=product&q=${encodeURIComponent(title)}`,
    },
    isFullyReadable: doc.public_scan_b === true || false,
  };
};

const mapBookFromSearch = (doc) => ({
  id:            doc.key?.replace('/works/', '') || doc.cover_edition_key || null,
  olKey:         doc.key || null,
  title:         doc.title || 'Untitled',
  authors:       doc.author_name || ['Unknown Author'],
  description:   doc.first_sentence?.[0] || null,
  cover:         buildCoverUrl(doc.cover_i, 'M'),
  coverLarge:    buildCoverUrl(doc.cover_i, 'L'),
  publishedYear: extractYear(doc.first_publish_year),
  pageCount:     doc.number_of_pages_median || null,
  categories:    doc.subject?.slice(0, 5) || [],
  rating:        doc.ratings_average ? parseFloat(doc.ratings_average.toFixed(1)) : null,
  ratingsCount:  doc.ratings_count || 0,
  language:      doc.language?.[0] || 'N/A',
  isbn:          doc.isbn?.[0] || null,
  links:         resolveBookLinks(doc),
});

const mapBookFromDetail = (work, editions = []) => {
  const bestEdition = editions[0] || {};
  const coverId     = work.covers?.[0] || bestEdition.covers?.[0] || null;
  const description = typeof work.description === 'string'
    ? work.description
    : work.description?.value || null;

  return {
    id:            work.key?.replace('/works/', '') || null,
    olKey:         work.key || null,
    title:         work.title || 'Untitled',
    // Note: Open Library Works API only returns author keys. 
    // Frontend may need to fetch author names separately or use data from search results.
    authors:       work.authors?.map(a => a.author?.key || '') || [],
    description,
    cover:         buildCoverUrl(coverId, 'M'),
    coverLarge:    buildCoverUrl(coverId, 'L'),
    publishedYear: extractYear(work.first_publish_date),
    pageCount:     bestEdition.number_of_pages || null,
    categories:    work.subjects?.slice(0, 5) || [],
    rating:        null, // Rating is not directly available in Works API
    ratingsCount:  0,
    language:      bestEdition.languages?.[0]?.key?.replace('/languages/', '') || 'N/A',
    isbn:          bestEdition.isbn_13?.[0] || bestEdition.isbn_10?.[0] || null,
    links: {
      readOnline: work.key ? `${OL_BASE}${work.key}` : null,
      buyLinks: {
        gramedia:  `https://www.gramedia.com/search/?q=${encodeURIComponent(work.title || '')}`,
        tokopedia: `https://www.tokopedia.com/search?st=product&q=${encodeURIComponent(work.title || '')}`,
      },
      isFullyReadable: false,
    },
  };
};

module.exports = { mapBookFromSearch, mapBookFromDetail };