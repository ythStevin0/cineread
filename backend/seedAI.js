const mongoose = require('mongoose');
require('dotenv').config();

const ItemSimilarity = require('./src/models/ItemSimilarity');

const dummyData = [
  {
    // Avengers: Infinity War
    tmdbId: 299536,
    title: 'Avengers: Infinity War',
    mediaType: 'movie',
    similarItems: [
      { tmdbId: 299534, title: 'Avengers: Endgame', score: 0.95, mediaType: 'movie' },
      { tmdbId: 284054, title: 'Black Panther', score: 0.88, mediaType: 'movie' },
      { tmdbId: 284053, title: 'Thor: Ragnarok', score: 0.85, mediaType: 'movie' },
      { tmdbId: 315635, title: 'Spider-Man: Homecoming', score: 0.82, mediaType: 'movie' }
    ]
  },
  {
    // Interstellar
    tmdbId: 157336,
    title: 'Interstellar',
    mediaType: 'movie',
    similarItems: [
      { tmdbId: 27205, title: 'Inception', score: 0.92, mediaType: 'movie' },
      { tmdbId: 286217, title: 'The Martian', score: 0.89, mediaType: 'movie' },
      { tmdbId: 330459, title: 'Rogue One: A Star Wars Story', score: 0.80, mediaType: 'movie' }
    ]
  },
  {
    // Stranger Things (TV)
    tmdbId: 66732,
    title: 'Stranger Things',
    mediaType: 'tv',
    similarItems: [
      { tmdbId: 119051, title: 'Wednesday', score: 0.90, mediaType: 'tv' },
      { tmdbId: 93405, title: 'Squid Game', score: 0.85, mediaType: 'tv' },
      { tmdbId: 60625, title: 'Rick and Morty', score: 0.78, mediaType: 'tv' }
    ]
  }
];

const seedDB = async () => {
  try {
    console.log('Menghubungkan ke MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Menghapus data lama...');
    await ItemSimilarity.deleteMany({});
    
    console.log('Memasukkan data dummy AI similarity...');
    await ItemSimilarity.insertMany(dummyData);
    
    console.log('Data dummy berhasil dimasukkan! ✅');
    process.exit(0);
  } catch (error) {
    console.error('Gagal memasukkan data dummy:', error);
    process.exit(1);
  }
};

seedDB();
