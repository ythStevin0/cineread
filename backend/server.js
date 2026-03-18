require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');
const movieRoutes = require('./src/routes/movieRoutes');
const bookRoutes = require('./src/routes/bookRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use('/api/movies', movieRoutes);
app.use('/api/books', bookRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    project: 'CineRead',
    timestamp: new Date(),
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🎬 CineRead server running on port ${PORT}`);
});