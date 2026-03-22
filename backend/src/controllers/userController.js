const History  = require('../models/History');
const Favorite = require('../models/Favorite');

// ── HISTORY ──────────────────────────────────────────────────

/**
 * GET /api/user/history
 */
const getHistory = async (req, res, next) => {
  try {
    const history = await History.find({ user: req.user._id })
      .sort({ viewedAt: -1 })
      .limit(50);

    res.json({ success: true, data: history });
  } catch (error) { next(error); }
};

/**
 * POST /api/user/history
 */
const addHistory = async (req, res, next) => {
  try {
    const { itemId, itemType, title, poster } = req.body;

    if (!itemId || !itemType || !title) {
      return res.status(400).json({
        success: false,
        message: 'itemId, itemType, dan title wajib diisi',
      });
    }

    await History.addHistory(req.user._id, { itemId, itemType, title, poster });

    res.json({ success: true, message: 'History berhasil ditambahkan' });
  } catch (error) { next(error); }
};

/**
 * DELETE /api/user/history
 * Hapus semua history user
 */
const clearHistory = async (req, res, next) => {
  try {
    await History.deleteMany({ user: req.user._id });
    res.json({ success: true, message: 'History berhasil dihapus' });
  } catch (error) { next(error); }
};

// ── FAVORITES ─────────────────────────────────────────────────

/**
 * GET /api/user/favorites
 */
const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: favorites });
  } catch (error) { next(error); }
};

/**
 * POST /api/user/favorites
 */
const addFavorite = async (req, res, next) => {
  try {
    const { itemId, itemType, title, poster, rating } = req.body;

    if (!itemId || !itemType || !title) {
      return res.status(400).json({
        success: false,
        message: 'itemId, itemType, dan title wajib diisi',
      });
    }

    const favorite = await Favorite.create({
      user: req.user._id,
      itemId, itemType, title, poster, rating,
    });

    res.status(201).json({
      success: true,
      message: 'Berhasil ditambahkan ke favorit',
      data: favorite,
    });
  } catch (error) {
    // Duplicate key — sudah ada di favorit
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Item sudah ada di favorit',
      });
    }
    next(error);
  }
};

/**
 * DELETE /api/user/favorites/:itemId
 */
const removeFavorite = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { itemType } = req.query;

    await Favorite.findOneAndDelete({
      user: req.user._id,
      itemId,
      itemType,
    });

    res.json({ success: true, message: 'Berhasil dihapus dari favorit' });
  } catch (error) { next(error); }
};

module.exports = {
  getHistory, addHistory, clearHistory,
  getFavorites, addFavorite, removeFavorite,
};