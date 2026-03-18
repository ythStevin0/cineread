const express = require('express');
const router  = express.Router();
const {
  getFeaturedBooks,
  getPopularBooks,
  getBookDetail,
  searchBooks,
} = require('../controllers/bookController');

router.get('/featured', getFeaturedBooks);
router.get('/popular',  getPopularBooks);
router.get('/search',   searchBooks);
router.get('/:id',      getBookDetail);

module.exports = router;