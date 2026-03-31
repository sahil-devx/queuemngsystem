const express = require('express');

const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { uploadProfileImage } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/register/send-otp', authController.sendRegisterOtp);
router.post('/register/verify-otp', authController.verifyRegisterOtp);
router.post('/register/complete', authController.completeRegister);
router.post('/login', authController.login);
router.post('/forgot-password/send-otp', authController.sendForgotPasswordOtp);
router.post('/forgot-password/verify-otp', authController.verifyForgotPasswordOtp);
router.post('/forgot-password/reset', authController.resetForgotPassword);
router.get('/me', authenticateJWT, authController.getMe);
router.put('/me', authenticateJWT, uploadProfileImage.single('profilePicture'), authController.updateMe);
router.get('/users', authenticateJWT, requireRole('admin'), authController.listUsers);

module.exports = router;

