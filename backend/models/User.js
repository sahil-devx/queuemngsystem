const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    password: { type: String, required: true }, // bcrypt hash
    role: { type: String, required: true, enum: ['user', 'admin'], default: 'user' },
    phone: { type: String, default: '', trim: true },
    profilePicture: { type: String, default: '/uploads/default-avatar.svg' },
    passwordResetOtpHash: { type: String, default: '' },
    passwordResetOtpExpiresAt: { type: Date, default: null },
    passwordResetOtpVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);

