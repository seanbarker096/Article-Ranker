/* eslint-disable prefer-object-spread */
const AppError = require('../utils/appError');

const sendErrorDev = (res, error) => {
    res.status(error.statusCode).json({
        status: error.status,
        error: error,
        message: error.message,
        stack: error.stack,
    });
};

const sendErrorProd = (res, error) => {
    if (error.isOperational) {
        return res.status(error.statusCode).json({
            //dont send stack
            status: 'error',
            message: error.message,
        });
    }
    res.status(error.statusCode).json({
        status: 'error',
        title: 'Something went wrong',
        message: 'Please try again',
    });
};

module.exports = (err, req, res, next) => {
    //log error in case nothing below catches it
    // console.log('NEW ERROR', err);
    //need to use object.assign to ensure custom props
    //added to App Class Instance are also copied
    let error = Object.assign(err);
    console.log(process.env.NODE_ENV);
    if (process.env.NODE_ENV === 'production') {
        //handle sepcific error types caused by user actions so we can format and
        //send to them
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map((el) => el.message);
            error = new AppError(
                `Invalid input data. ${errors.join(' ')}`,
                400
            );
        }
        if (err.name === 'CastError') {
            const message = `Invalid ${err.path}: ${err.value}`;
            error = new AppError(message, 400);
        }

        if (err.name === 'DisconnectedError') {
            const message =
                'Currently unable to connect to app database. Please try again later';
            error = new AppError(message, 503);
        }
        if (err.code === 11000) {
            const message = `The ${Object.keys(err.keyValue).join(
                ''
            )}: ${Object.values(err.keyValue).join(
                ''
            )} already exists in the database.`;
            error = new AppError(message, 400);
        }

        if (err.name === 'TokenExpiredError') {
            const message =
                'Authentication token has expired. Sign in to get a new one';
            error = new AppError(message, 401);
        }
        if (err.name === 'JsonWebTokenError') {
            const message =
                'Authentication token is not valid. Please sign in to get a new one';
            error = new AppError(message, 401);
        }
    }
    error.statusCode = err.statusCode || 500;
    error.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') sendErrorDev(res, error);
    sendErrorProd(res, error);
};
