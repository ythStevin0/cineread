require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB     = require('./src/config/db');
const errorHandler  = require('./src/middleware/errorHandler');
const movieRoutes   = require('./src/routes/movieRoutes');
const tvRoutes      = require('./src/routes/tvRoutes');
const bookRoutes    = require('./src/routes/bookRoutes');
const authRoutes    = require('./src/routes/authRoutes');
const userRoutes    = require('./src/routes/userRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({
  origin: (origin, callback) => {
    // Izinkan localhost untuk dev, dan FRONTEND_URL untuk prod
    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000'
    ].filter(Boolean);
    
    // Jika tidak ada origin (seperti mobile app atau server-to-server) atau ada di list allowed
    if (!origin || allowed.some(url => url.startsWith(origin) || origin.startsWith(url))) {
      callback(null, true);
    } else {
      // Untuk kemudahan setup, kita izinkan sementara selama masa testing jika FRONTEND_URL belum set
      if (!process.env.FRONTEND_URL) callback(null, true);
      else callback(new Error('Blocked by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api/movies', movieRoutes);
app.use('/api/tv',     tvRoutes);
app.use('/api/books',  bookRoutes);
app.use('/api/auth',   authRoutes);
app.use('/api/user',   userRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    status:    'OK',
    project:   'CineRead',
    timestamp: new Date(),
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🎬 CineRead server running on port ${PORT}`);
});
