const winston = require('winston');

// Custom error class for application errors
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle MongoDB CastError
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Handle MongoDB duplicate fields
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

// Handle MongoDB validation errors
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Handle JWT errors
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

// Send error response in development
const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.statusCode,
        message: err.message,
        details: err.errors || null
      },
      debug: {
        status: err.status,
        stack: err.stack
      }
    });
  }

  // B) RENDERED WEBSITE (if you have frontend)
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).json({
    title: 'Something went wrong!',
    msg: err.message
  });
};

// Send error response in production
const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        success: false,
        error: {
          code: err.statusCode,
          message: err.message
        }
      });
    }

    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    winston.error('ERROR 💥', err);

    // 2) Send generic message
    return res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: 'Something went wrong!'
      }
    });
  }

  // B) RENDERED WEBSITE (if you have frontend)
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      title: 'Something went wrong!',
      msg: err.message
    });
  }

  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  winston.error('ERROR 💥', err);

  // 2) Send generic message
  return res.status(err.statusCode).json({
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });
};

// Global error handling middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};

// Async error wrapper for catch blocks
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  AppError,
  globalErrorHandler,
  catchAsync
};
