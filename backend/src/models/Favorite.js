const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },
  itemId: {
    type:     String,
    required: true,
  },
  itemType: {
    type:     String,
    enum:     ['movie', 'tv', 'book'],
    required: true,
  },
  title:  { type: String, required: true },
  poster: { type: String, default: null },
  rating: { type: String, default: null },
}, { timestamps: true });

// Satu user tidak bisa favorite item yang sama 2x
favoriteSchema.index({ user: 1, itemId: 1, itemType: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);