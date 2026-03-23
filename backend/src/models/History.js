const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
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
  viewedAt: {
    type:    Date,
    default: Date.now,
  },
}, { timestamps: true });

// Index untuk query cepat per user
historySchema.index({ user: 1, viewedAt: -1 });

// Maksimal 50 history per user — hapus yang terlama
historySchema.statics.addHistory = async function (userId, itemData) {
  await this.findOneAndUpdate(
    { user: userId, itemId: itemData.itemId, itemType: itemData.itemType },
    { ...itemData, user: userId, viewedAt: new Date() },
    { upsert: true, new: true }
  );

  // Hapus history lebih dari 50
  const count = await this.countDocuments({ user: userId });
  if (count > 50) {
    const oldest = await this.find({ user: userId })
      .sort({ viewedAt: 1 })
      .limit(count - 50);
    await this.deleteMany({ _id: { $in: oldest.map(h => h._id) } });
  }
};

module.exports = mongoose.model('History', historySchema);