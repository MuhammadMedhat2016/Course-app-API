const APIError = require('../utils/apiError');

const handleCastErrorDB = (err) => {
  return new APIError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleDuplicateKeyErrorDB = (err) => {
  const message = `Duplicate key value: ${err.keyValue.name} please use another value`;
  return new APIError(message, 400);
};

const handleValidationErrorDB = (err) => new APIError(err.message, 400);

const handleInvalidTokenError = (err) =>
  new APIError('Invalid Token, please log-in again', 401);

const handleExpiredTokenError = (err) =>
  new APIError('Expired Token, please log-in again', 401);

const reportErrorProd = (err, res) => {
  if (err.isOperaional) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

  } else {
    console.log(err);
    res.status(err.statusCode).json({
      status: err.status,
      message: 'Something went wrong',
    });
  }
};

const reportErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    stauts: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    reportErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err.isOperaional ? err : { ...err };
    // convert Mongoose Cast Error to an Operational Error
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    // convert MongoDB driver duplicate key error to an Operational Error
    if (err.code === 11000) error = handleDuplicateKeyErrorDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleInvalidTokenError(err);
    if (err.name === 'TokenExpiredError') error = handleExpiredTokenError(err);
    reportErrorProd(error, res);
  }
};
