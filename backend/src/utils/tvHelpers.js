const { mapCommonData } = require('./tmdbHelpers');

const mapTvData = (show, providersData = null, trailers = [], aggregateCredits = null) => {
  const mapped = mapCommonData(show, 'tv', providersData, trailers);
  
  const cast = aggregateCredits?.cast?.slice(0, 15).map(c => ({
    id: c.id,
    name: c.name,
    character: c.roles?.[0]?.character,
    episodeCount: c.roles?.[0]?.episode_count,
    profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : null,
  })) || [];

  return {
    ...mapped,
    seasons:  show.number_of_seasons || null,
    episodes: show.number_of_episodes || null,
    status:   show.status || null,
    cast,
  };
};

module.exports = { mapTvData };

