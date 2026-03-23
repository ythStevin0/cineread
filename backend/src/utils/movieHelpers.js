const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';
const PROVIDER_IDS = { netflix: 8, disneyPlus: 337, googlePlay: 3 };

const resolveLinks = (providersData, trailerKey, title) => {
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

  // Nonton API: Netflix → Disney+ → Nonton Gratis
  let nontonLink = null;
  if (hasNetflix) nontonLink = { platform: 'Netflix', url: tmdbLink };
  else if (hasDisney) nontonLink = { platform: 'Disney+', url: tmdbLink };
  else if (tmdbLink) nontonLink = { platform: 'Nonton Gratis', url: tmdbLink };
  else nontonLink = { platform: 'Nonton Gratis', url: justWatchLink };

  // Trailer API: Netflix → Disney+ → YouTube → Google Play → Nonton Gratis lainnya
  let trailerLink = null;
  if (hasNetflix) trailerLink = { platform: 'Netflix', url: tmdbLink };
  else if (hasDisney) trailerLink = { platform: 'Disney+', url: tmdbLink };
  else if (trailerKey) trailerLink = { platform: 'YouTube', url: `https://youtube.com/watch?v=${trailerKey}`, isYoutube: true, key: trailerKey };
  else if (hasGooglePlay) trailerLink = { platform: 'Google Play', url: tmdbLink };
  else if (tmdbLink) trailerLink = { platform: 'Nonton Gratis lainnya', url: tmdbLink };
  else trailerLink = { platform: 'Nonton Gratis lainnya', url: justWatchLink };

  return { nontonLink, trailerLink };
};

const mapMovieData = (movie, providersData = null, trailerKey = null) => {
  const { nontonLink, trailerLink } = resolveLinks(providersData, trailerKey, movie.title);

  return {
    id:            movie.id,
    title:         movie.title,
    overview:      movie.overview,
    poster:        movie.poster_path ? `${TMDB_IMG}${movie.poster_path}` : null,
    backdrop:      movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
    rating:        movie.vote_average ? parseFloat(movie.vote_average.toFixed(1)) : null,
    releaseYear:   movie.release_date?.split('-')[0] || 'N/A',
    genres:        movie.genres?.map(g => g.name) || [],
    runtime:       movie.runtime ? `${movie.runtime} min` : null,
    trailerLink,
    nontonLink,
    mediaType:     'movie'
  };
};

module.exports = { mapMovieData };
