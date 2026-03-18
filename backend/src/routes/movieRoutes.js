const express = require('express');
const router  = express.Router();
const {
  getTrendingMovies,
  getPopularMovies,
  getMovieDetail,
  searchMovies,
} = require('../controllers/movieController');

router.get('/trending', getTrendingMovies);
router.get('/popular',  getPopularMovies);
router.get('/search',   searchMovies);
router.get('/:id',      getMovieDetail);

module.exports = router;