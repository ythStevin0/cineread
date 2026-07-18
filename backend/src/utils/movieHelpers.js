const { mapCommonData } = require('./tmdbHelpers');

const mapMovieData = (movie, providersData = null, trailers = [], credits = null) => {
  const mapped = mapCommonData(movie, 'movie', providersData, trailers);
  
  const cast = credits?.cast?.slice(0, 15).map(c => ({
    id: c.id,
    name: c.name,
    character: c.character,
    profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : null,
  })) || [];

  const directorObj = credits?.crew?.find(c => c.job === 'Director');
  const director = directorObj ? directorObj.name : null;
  
  const writerObj = credits?.crew?.find(c => c.job === 'Screenplay' || c.job === 'Writer');
  const writer = writerObj ? writerObj.name : null;

  const studios = movie.production_companies?.slice(0, 3).map(c => c.name).join(', ') || null;
  const budget = movie.budget > 0 ? movie.budget : null;
  const revenue = movie.revenue > 0 ? movie.revenue : null;

  return {
    ...mapped,
    runtime: movie.runtime ? `${movie.runtime} min` : null,
    director,
    writer,
    studios,
    budget,
    revenue,
    cast,
  };
};

module.exports = { mapMovieData };
