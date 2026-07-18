const { mapCommonData } = require('./tmdbHelpers');

const mapMovieData = (movie, providersData = null, trailers = [], credits = null) => {
  const mapped = mapCommonData(movie, 'movie', providersData, trailers);
  
  const cast = credits?.cast?.slice(0, 15).map(c => ({
    id: c.id,
    name: c.name,
    character: c.character,
    profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : null,
  })) || [];

  return {
    ...mapped,
    runtime: movie.runtime ? `${movie.runtime} min` : null,
    cast,
  };
};

module.exports = { mapMovieData };
