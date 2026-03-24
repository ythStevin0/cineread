const { mapCommonData } = require('./tmdbHelpers');

const mapMovieData = (movie, providersData = null, trailers = []) => {
  const mapped = mapCommonData(movie, 'movie', providersData, trailers);
  return {
    ...mapped,
    runtime: movie.runtime ? `${movie.runtime} min` : null,
  };
};

module.exports = { mapMovieData };
