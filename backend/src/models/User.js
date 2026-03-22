const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type:      String,
    required:  [true, 'Username wajib diisi'],
    unique:    true,
    trim:      true,
    minlength: [3, 'Username minimal 3 karakter'],
    maxlength: [20, 'Username maksimal 20 karakter'],
  },
  email: {
    type:      String,
    required:  [true, 'Email wajib diisi'],
    unique:    true,
    trim:      true,
    lowercase: true,
    match:     [/^\S+@\S+\.\S+$/, 'Format email tidak valid'],
  },
  password: {
    type:      String,
    required:  [true, 'Password wajib diisi'],
    minlength: [6, 'Password minimal 6 karakter'],
    select:    false,
  },
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function(inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);