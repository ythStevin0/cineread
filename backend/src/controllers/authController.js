const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ── Helper: generate JWT token ────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ── Helper: format response user (tanpa password) ────────────
const formatUser = (user) => ({
  id:        user._id,
  username:  user.username,
  email:     user.email,
  createdAt: user.createdAt,
});

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validasi input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, dan password wajib diisi',
      });
    }

    // Cek apakah email atau username sudah terdaftar
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      return res.status(400).json({
        success: false,
        message: `${field} sudah terdaftar`,
      });
    }

    // Buat user baru — password otomatis di-hash via pre-save hook
    const user  = await User.create({ username, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      token,
      user: formatUser(user),
    });
  } catch (error) {
    // Handle Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi',
      });
    }

    // Ambil user + password (select: false jadi harus eksplisit)
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login berhasil',
      token,
      user: formatUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Ambil data user yang sedang login (butuh token)
 */
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: formatUser(req.user),
  });
};

module.exports = { register, login, getMe };