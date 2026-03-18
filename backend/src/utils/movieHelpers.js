const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';
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
  rating:        movie.vote_average ? parseFloat(movie.vote_average.toFixed(1)) : null,
  releaseYear:   movie.release_date?.split('-')[0] || 'N/A',
  genres:        movie.genres?.map(g => g.name) || [],
  runtime:       movie.runtime ? `${movie.runtime} min` : null,
  trailerKey:    null,
  streamingLink: providersData
                   ? resolveStreamingLink(providersData, movie.title)
                   : null,
});

module.exports = { mapMovieData, resolveStreamingLink };
