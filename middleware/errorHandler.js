class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;

    statusCode = statusCode || 500;
    message = message || 'Internal Server Error';

    // Log error
    console.error('ERROR:', {
        statusCode,
        message,
        stack: err.stack,
        timestamp: new Date().toISOString()
    });

    // MongoDB duplicate key error
    if (err.code === 11000) {
        statusCode = 409;
        message = 'Duplicate field value entered';
    }

    // MongoDB validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(e => e.message).join(', ');
    }

    res.status(statusCode).json({
        status: statusCode >= 400 && statusCode < 500 ? 'fail' : 'error',
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = { AppError, errorHandler, asyncHandler };