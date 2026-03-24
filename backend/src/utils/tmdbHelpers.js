const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP = 'https://image.tmdb.org/t/p/w1280';
const PROVIDER_IDS = { netflix: 8, disneyPlus: 337, googlePlay: 3 };

const resolveLinks = (providersData, trailers, title) => {
  const regions = ['ID', 'US'];
  let regionData = null;
  for (const region of regions) {
    if (providersData?.results?.[region]) {
      regionData = providersData.results[region];
      break;
    }
  }

  const flatrate = regionData?.flatrate || [];
  const buy      = regionData?.buy || [];
  const rent     = regionData?.rent || [];
  
  const hasNetflix    = flatrate.some(p => p.provider_id === PROVIDER_IDS.netflix);
  const hasDisney     = flatrate.some(p => p.provider_id === PROVIDER_IDS.disneyPlus);
  const hasGooglePlay = [...buy, ...rent].some(p => p.provider_id === 3 || p.provider_name?.includes('Google Play'));

  const tmdbLink = regionData?.link || null;
  const searchQuery = encodeURIComponent(title);
  const justWatchLink = `https://www.justwatch.com/id/search?q=${searchQuery}`;

  // Nonton API Priority
  let nontonLink = null;
  if (hasNetflix) nontonLink = { platform: 'Netflix', url: tmdbLink };
  else if (hasDisney) nontonLink = { platform: 'Disney+', url: tmdbLink };
  else if (tmdbLink) nontonLink = { platform: 'Nonton Gratis', url: tmdbLink };
  else nontonLink = { platform: 'Nonton Gratis', url: justWatchLink };

  // Best Trailer found: prioritize Official YouTube trailers
  const officialTrailers = trailers.filter(t => t.type === 'Trailer' && t.site === 'YouTube' && t.official);
  const otherTrailers    = trailers.filter(t => t.type === 'Trailer' && t.site === 'YouTube' && !t.official);
  
  const bestTrailer = officialTrailers[0] || otherTrailers[0] || null;
  
  let trailerLink = null;
  if (bestTrailer) {
    trailerLink = { platform: 'YouTube', url: `https://youtube.com/watch?v=${bestTrailer.key}`, isYoutube: true, key: bestTrailer.key, name: bestTrailer.name };
  } else if (hasNetflix) trailerLink = { platform: 'Netflix', url: tmdbLink };
  else if (hasDisney) trailerLink = { platform: 'Disney+', url: tmdbLink };
  else if (hasGooglePlay) trailerLink = { platform: 'Google Play', url: tmdbLink };
  else if (tmdbLink) trailerLink = { platform: 'Nonton Gratis lainnya', url: tmdbLink };
  else trailerLink = { platform: 'Nonton Gratis lainnya', url: justWatchLink };

  const allYoutubeTrailers = [...officialTrailers, ...otherTrailers].map(t => ({ name: t.name, key: t.key, type: t.type }));

  return { nontonLink, trailerLink, allTrailers: allYoutubeTrailers };
};

const mapCommonData = (item, type, providersData, trailers) => {
  const title = item.title || item.name;
  
  // Synopsis Fallback: Use overview if available, otherwise 'Informasi tidak tersedia'
  const overview = item.overview || 'Sinopsis tidak tersedia untuk film/serial ini.';

  const { nontonLink, trailerLink, allTrailers } = resolveLinks(providersData, trailers || [], title);

  return {
    id:            item.id,
    title,
    overview,
    poster:        item.poster_path ? `${TMDB_IMG}${item.poster_path}` : null,
    backdrop:      item.backdrop_path ? `${TMDB_BACKDROP}${item.backdrop_path}` : null,
    rating:        item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : null,
    releaseYear:   (item.release_date || item.first_air_date)?.split('-')[0] || 'N/A',
    genres:        item.genres?.map(g => g.name) || [],
    trailerLink,
    trailers:      allTrailers,
    nontonLink,
    mediaType:     type
  };
};

module.exports = { mapCommonData, TMDB_IMG, TMDB_BACKDROP };
