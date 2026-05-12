const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const winston = require('winston');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Register new user
const register = catchAsync(async (req, res, next) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400));
  }

  const { username, email, password, role, department } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    return next(new AppError('User with this email or username already exists', 400));
  }

  // Create new user
  const user = new User({
    username,
    email,
    password,
    role: role || 'security',
    department
  });

  await user.save();

  // Generate token
  const token = generateToken(user._id);

  winston.info(`New user registered: ${username} (${email})`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      token
    }
  });
});

// Login user
const login = catchAsync(async (req, res, next) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400));
  }

  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new AppError('Account is deactivated. Please contact administrator.', 401));
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

  winston.info(`User logged in: ${user.username} (${email})`);

  res.status(200).json({
    success: true,
    message: 'Login successful',
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

// Request password reset token
const forgotPassword = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400));
  }

  const { email } = req.body;
  const user = await User.findOne({ email });

  // Do not leak account existence
  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a reset link has been generated',
      data: {}
    });
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  await user.save();

  // Dev-friendly fallback until email sender is wired
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${rawToken}`;

  res.status(200).json({
    success: true,
    message: 'Password reset token generated',
    data: {
      resetUrl: process.env.NODE_ENV === 'production' ? undefined : resetUrl
    }
  });
});

// Reset password using token
const resetPassword = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400));
  }

  const { token, newPassword } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() }
  }).select('+password');

  if (!user) {
    return next(new AppError('Reset token is invalid or expired', 400));
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully',
    data: {}
  });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword
};
