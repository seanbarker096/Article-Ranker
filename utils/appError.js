class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = 'error';
        //as these errors will only be created by us in our code, create property to highlight this
        //and show it is operational error
        this.isOperational = true;
        //set stack property but only keep frames below the constructor in error message
        Error.captureStackTrace(this, this.constructor);
    }
}
module.exports = AppError;
