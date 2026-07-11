const mongoose = require('mongoose');

/**
 * Schema untuk menyimpan data similarity antar item (film/TV).
 * Data ini di-generate oleh AI model (Python/Colab) dan di-upload ke MongoDB.
 * Backend Node.js hanya MEMBACA data ini, tidak menulis.
 */
const itemSimilaritySchema = new mongoose.Schema({
  tmdbId: {
    type:     Number,
    required: true,
    unique:   true,
    index:    true,
  },
  title: {
    type: String,
    default: null,
  },
  mediaType: {
    type:    String,
    enum:    ['movie', 'tv'],
    default: 'movie',
  },
  // Top-20 item paling mirip (pre-computed oleh AI)
  similarItems: [{
    tmdbId: { type: Number, required: true },
    title:  { type: String, default: null },
    score:  { type: Number, required: true },   // Cosine similarity 0-1
    mediaType: { type: String, default: 'movie' },
  }],
  // Vektor embedding untuk real-time similarity (opsional)
  embedding: {
    type:    [Number],
    default: [],
  },
  // Metadata genre untuk Content-Based fallback
  genres: {
    type:    [String],
    default: [],
  },
}, {
  timestamps: true,
  collection: 'item_similarities',  // Nama collection eksplisit
});

// Index untuk query cepat
itemSimilaritySchema.index({ tmdbId: 1, mediaType: 1 });

module.exports = mongoose.model('ItemSimilarity', itemSimilaritySchema);
