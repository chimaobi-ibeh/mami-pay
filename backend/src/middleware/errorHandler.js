class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational !== undefined ? err.isOperational : false;

  if (process.env.NODE_ENV === 'production' && !isOperational) {
    console.error('Non-operational error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }

  const errorMessage = err.message || 'Something went wrong. Please try again later.';
  res.status(statusCode).json({ error: errorMessage });
};

module.exports = { AppError, errorHandler };