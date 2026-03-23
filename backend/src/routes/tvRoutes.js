const express = require('express');
const router  = express.Router();
const { getTrendingTv, getPopularTv, getTvDetail, searchTv } = require('../controllers/tvController');

router.get('/trending', getTrendingTv);
router.get('/popular',  getPopularTv);
router.get('/search',   searchTv);
router.get('/:id',      getTvDetail);

module.exports = router;
