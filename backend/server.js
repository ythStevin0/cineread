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
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://localhost:3000'
    ].filter(Boolean).map(url => url.replace(/\/$/, ''));
    
    // Jika tidak ada origin (seperti mobile app atau server-to-server)
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked CORS for origin:', origin);
      // Untuk kemudahan setup, kita izinkan sementara selama masa testing
      callback(null, true);
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
