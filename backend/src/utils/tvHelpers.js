const { mapCommonData } = require('./tmdbHelpers');

const mapTvData = (show, providersData = null, trailers = []) => {
  const mapped = mapCommonData(show, 'tv', providersData, trailers);
  return {
    ...mapped,
    seasons:  show.number_of_seasons || null,
    episodes: show.number_of_episodes || null,
    status:   show.status || null,
  };
};

module.exports = { mapTvData };

