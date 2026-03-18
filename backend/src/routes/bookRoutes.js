const express = require('express');
const router  = express.Router();
const {
  getFeaturedBooks,
  getBookDetail,
  searchBooks,
} = require('../controllers/bookController');

router.get('/featured', getFeaturedBooks);
router.get('/search',   searchBooks);
router.get('/:id',      getBookDetail);

module.exports = router;