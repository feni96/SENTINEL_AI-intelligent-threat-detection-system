const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const winston = require('winston');
const { logAdminAction } = require('../middleware/authMiddleware');
const emailService = require('../services/emailService');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Registration disabled for single admin system
// const register = catchAsync(async (req, res, next) => {
//   return next(new AppError('User registration is disabled. Please contact administrator.', 403));
// });

// Login user - Single Admin System
const login = catchAsync(async (req, res, next) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400));
  }

  const { email, password } = req.body;

  // Hardcoded admin credentials for single-admin system
  const ADMIN_EMAIL = 'fenetmahdi@gmail.com';
  const ADMIN_USERNAME = 'admin';

  // Validate against hardcoded admin credentials
  if (email !== ADMIN_EMAIL) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Find admin user by email
  const user = await User.findOne({ email: ADMIN_EMAIL }).select('+password');

  if (!user) {
    return next(new AppError('Admin account not found. Please contact system administrator.', 401));
  }

  // Check if User is active
  if (!user.isActive) {
    return next(new AppError('Admin account is deactivated. Please contact system administrator.', 401));
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  // Log admin login action
  await logAdminAction(
    user.username,
    'Login',
    '-',
    'Success',
    `Administrator logged in from IP ${req.ip}`,
    user._id,
    req.ip
  );

  winston.info(`Admin logged in: ${user.username} (${ADMIN_EMAIL})`);

  res.status(200).json({
    success: true,
    message: 'Admin login successful',
    data: {
      user,
      token
    }
  });
});

// Get current user profile
const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

// Update user profile
const updateProfile = catchAsync(async (req, res, next) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400));
  }

  const { username, department } = req.body;
  const updateData = {};

  if (username) updateData.username = username;
  if (department) updateData.department = department;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user
    }
  });
});

// Change password
const changePassword = catchAsync(async (req, res, next) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400));
  }

  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);

  if (!isCurrentPasswordValid) {
    return next(new AppError('Current password is incorrect', 400));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  winston.info(`Password changed for user: ${user.username}`);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

// Logout user (client-side token removal)
const logout = catchAsync(async (req, res, next) => {
  // In a stateless JWT setup, logout is handled client-side
  // However, we can implement token blacklisting if needed
  winston.info(`User logged out: ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

// Refresh token
const refreshToken = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user || !user.isActive) {
    return next(new AppError('User not found or inactive', 401));
  }

  // Generate new token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      token
    }
  });
});

// Forgot password - Generate reset token for admin
const forgotPassword = catchAsync(async (req, res, next) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400));
  }

  const { email } = req.body;

  // For single admin system, only allow the admin email
  const ADMIN_EMAIL = 'fenetmahdi@gmail.com';
  
  if (email !== ADMIN_EMAIL) {
    // Return error for non-admin emails
    return next(new AppError('Only the admin email can reset password. Please contact system administrator.', 403));
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  // Set token expiry (15 minutes)
  const resetTokenExpires = Date.now() + 15 * 60 * 1000;

  // Update user with reset token
  const user = await User.findOne({ email: ADMIN_EMAIL });
  if (!user) {
    return next(new AppError('Admin account not found. Please contact system administrator.', 404));
  }

  user.passwordResetToken = resetTokenHash;
  user.passwordResetExpires = resetTokenExpires;
  await user.save();

  // Generate reset URL
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  
  // Send password reset email
  try {
    const emailResult = await emailService.sendPasswordResetEmail(ADMIN_EMAIL, resetToken, resetUrl);
    winston.info(`Password reset email sent to ${ADMIN_EMAIL}`, {
      messageId: emailResult.messageId
    });
  } catch (emailError) {
    winston.error(`Failed to send password reset email to ${ADMIN_EMAIL}:`, emailError);
    // Don't fail the request if email fails - user can still use the token
    // In production, you might want to handle this differently
  }

  winston.info(`Password reset requested for admin: ${ADMIN_EMAIL}`);

  res.status(200).json({
    success: true,
    message: 'Password reset link sent to your email',
    // In development, include the token for testing
    ...(process.env.NODE_ENV === 'development' && { resetToken, resetUrl })
  });
});

// Reset password - Validate token and update password
const resetPassword = catchAsync(async (req, res, next) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400));
  }

  const { token, newPassword } = req.body;

  // Hash the token to compare with stored hash
  const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with valid reset token
  const user = await User.findOne({
    passwordResetToken: resetTokenHash,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Password reset token is invalid or has expired', 400));
  }

  // Update password
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  winston.info(`Password reset completed for user: ${user.username}`);

  res.status(200).json({
    success: true,
    message: 'Password reset successfully'
  });
});

module.exports = {
  // register: disabled for single admin system,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword
};
