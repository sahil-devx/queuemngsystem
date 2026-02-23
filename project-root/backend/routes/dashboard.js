const express = require('express');
const path = require('path');
const auth = require('../middleware/auth');

const router = express.Router();

// Serve user dashboard
router.get('/user', auth, (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'Access denied' });
  }
  res.sendFile(path.join(__dirname, '../../frontend/user.html'));
});

// Serve admin dashboard
router.get('/admin', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  res.sendFile(path.join(__dirname, '../../frontend/admin.html'));
});

// Get current user info
router.get('/me', auth, (req, res) => {
  res.json({
    id: req.user._id,
    email: req.user.email,
    name: req.user.name,
    role: req.user.role
  });
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;