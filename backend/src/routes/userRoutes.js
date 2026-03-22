const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getHistory, addHistory, clearHistory,
  getFavorites, addFavorite, removeFavorite,
} = require('../controllers/userController');

// Semua route di sini butuh login
router.use(protect);

router.get('/history',           getHistory);
router.post('/history',          addHistory);
router.delete('/history',        clearHistory);

router.get('/favorites',         getFavorites);
router.post('/favorites',        addFavorite);
router.delete('/favorites/:itemId', removeFavorite);

module.exports = router;