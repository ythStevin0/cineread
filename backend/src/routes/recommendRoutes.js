const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getSimilarItems,
  getPersonalRecommendations,
} = require('../controllers/recommendController');

// Film/TV serupa — tidak perlu login (Content-Based)
router.get('/similar/:tmdbId', getSimilarItems);

// Rekomendasi personal — butuh login (Hybrid)
router.get('/', protect, getPersonalRecommendations);

module.exports = router;
