const jwt = require('jsonwebtoken');
const passport = require('passport');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const CSRFToken = require('../utils/tokens/csrfToken');
const RefreshToken = require('../utils/tokens/refreshToken');
const Token = require('../utils/tokens/token');
const TokenCookie = require('../utils/cookies/tokenCookie');
const MongoRefreshToken = require('../models/refreshTokenModel');
const AppError = require('../utils/appError');

const tokenOptions = {
    issuer: process.env.APP_NAME,
    noTimestamp: false,
};

const csrfTokenExpiryTime = '86400s';
const jwtTokenExpiryTime = '1800s';
const jwtRefreshExpiryTime = '2592000s';

//MAYBE MOVE THIS SO DONT CREATE TOKENS EVERY TIME IF NOT NEEDED
//create token instances
const csrfToken = new CSRFToken(process.env.CSRF_PRIVATE_KEY, {
    ...tokenOptions,
    expiresIn: csrfTokenExpiryTime,
});

const jwtToken = new Token(process.env.JWT_PRIVATE_KEY, {
    ...tokenOptions,
    expiresIn: jwtTokenExpiryTime,
});

const jwtRefreshToken = new RefreshToken(process.env.JWT_PRIVATE_KEY, {
    ...tokenOptions,
    expiresIn: jwtRefreshExpiryTime,
});

//create cookies (each has own expiry time which can be changed so create seperately)
const csrfCookie = new TokenCookie('csrf');
const jwtCookie = new TokenCookie('jwt');
const jwtRefreshCookie = new TokenCookie('jwtRefresh');

const createTokensAndCookies = async (req, res, next, refreshTokenIsValid) => {
    const promises = [];
    //return hashed token and also raw token value to be stored locally on client side
    // const { csrf, csrfTokenVal } = await csrfToken.create();
    // res.set('csrf-token', `${csrfTokenVal}`);
    promises.push(jwtToken.sign({ id: req.user._id }));
    // promises.push(csrf);
    //if no previous refresh token or dont have one because logging in then issue new one
    if (!refreshTokenIsValid) promises.push(jwtRefreshToken.create(req.user));
    const tokens = await Promise.all(promises);
    //create coookies and new promise wchihc only resolves once all cookies created
    jwtCookie.create(req, res, tokens[0]);
    // csrfCookie.create(req, res, tokens[1]);
    if (!refreshTokenIsValid) jwtRefreshCookie.create(req, res, tokens[1]);
};

const sendResponse = (res, user, statusCode) => {
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        data: {
            user,
        },
    });
};

const checkRefreshTokenOnLogin = async (currentRefreshToken) => {
    //check to see if their resetToken is still valid
    if (!currentRefreshToken) return false;
    const refreshTokenIsValid = await jwtRefreshToken.verifyRefreshToken(
        currentRefreshToken,
        true
    );
    return refreshTokenIsValid;
};

/////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////// ROUTE HANDLERS //////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
exports.getRefreshToken = async (req, res, next) => {
    const decoded = jwt.verify(
        req.cookies.jwtRefresh,
        process.env.JWT_PRIVATE_KEY
    );
    const token = await MongoRefreshToken.find({
        refreshTokenId: decoded.refreshTokenId,
    });
    res.send('success');
};

exports.signUp = catchAsync(async (req, res, next) => {
    //get only certain variables out of req object
    const { body } = req;

    const newUser = await User.create({
        name: body.name,
        email: body.email,
        password: body.password,
        passwordConfirmation: body.passwordConfirmation,
    });

    req.user = newUser;
    await createTokensAndCookies(req, res);
    sendResponse(res, req.user, 201);
});

//NEED TO ADD SOME FUNCTION TO CLEAR OLD REFRESH TOKENS FROM DATABASE

exports.signIn = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 400));
    }
    //if current refresh token invalid then returns false so can later
    //issue new one
    const refreshTokenIsValid = await checkRefreshTokenOnLogin(
        req.cookies.jwtRefresh
    );
    req.user = user;
    await createTokensAndCookies(req, res, next, refreshTokenIsValid);
    sendResponse(res, req.user, 200);
});

exports.signOut = catchAsync(async (req, res, next) => {
    //remove users refresh token from database
    if (req.cookies.jwtRefresh) {
        const decoded = await promisify(jwt.verify)(
            req.cookies.jwtRefresh,
            jwtRefreshToken.secretOrPrivateKey
        );
        await MongoRefreshToken.findOneAndDelete({
            refreshTokenId: decoded.refreshTokenId,
        });
    }
    //expire cookie except for csrf one
    jwtCookie.delete(res);
    jwtRefreshCookie.delete(res);
    //even if token not valid just send success as they wouldnt have been signed in anyway
    res.status(200).json({
        status: 'success',
    });
});

//this is only used when user first visits site before logging in, so that
//when they make a login POST reuqest they have a valid CSRF token
exports.getCSRFToken = catchAsync(async (req, res, next) => {
    const { csrf, csrfTokenVal } = await csrfToken.create();
    res.set('csrf-token', `${csrfTokenVal}`);
    csrfCookie.create(req, res, csrf);
    res.status(200).json({
        status: 'success',
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    const userToken = req.cookies.jwt;
    if (!userToken) {
        return next(
            new AppError(
                'You are not signed in. Pleae sign in to get access',
                400
            )
        );
    }
    let decoded;
    try {
        decoded = await jwtToken.verify(userToken);
    } catch (err) {
        return next(
            new AppError(
                'You must be signed in to complete this action. If you are not already signed in, please sign in. Otherwise, please try signing in again.'
            )
        );
    }

    //check if user associated with token still exists
    const user = await User.findById(decoded.id);
    if (!user)
        return next(
            new AppError(
                'User associated with authentication token no longer exists',
                400
            )
        );

    //check if user changed password since token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError(
                'User has updated password since token issue. Please sign in again',
                400
            )
        );
    }

    req.user = user;
    next();
    //if there is rejected promise from verify, Express with pass to err handler
});

exports.changePassword = catchAsync(async (req, res, next) => {
    //check old passwords

    const user = await User.findOne({ _id: req.user._id }).select('+password');

    if (
        !(await user.correctPassword(req.body.currentPassword, user.password))
    ) {
        return next(new AppError('Password entered is incorrect', 400));
    }

    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.passwordConfirm;
    //use save so password validation runs
    await user.save();

    //create new tokens. One of reasons why user might update password is bceause token stolen
    await createTokensAndCookies(req, res, next, req.cookies.jwtRefresh);
    sendResponse(res, user, 200);
});

////////////////////////TOKEN HANDLING////////////////////////////////////////

exports.refreshJwt = catchAsync(async (req, res, next) => {
    //if refresh token validn then send new jwt
    // console.log('refresh token', req.cookies.jwtRefresh);
    const refreshToken = await jwtRefreshToken.verifyRefreshToken(
        req.cookies.jwtRefresh
    );
    //create new jwt using userId associated with the refresh token we received
    const newJwt = await jwtToken.sign({ id: refreshToken.owner });
    jwtCookie.create(req, res, newJwt);

    // console.log('Old token', jwt.decode(req.cookies.jwt, { complete: true }));
    // console.log('New token', jwt.decode(newJwt, { complete: true }));

    res.status(200).json({
        status: 'success',
    });
});

exports.checkCsrfToken = catchAsync(async (req, res, next) => {
    //will throw error if csrf token not valid
    await csrfToken.verifyCsrfToken(req.cookies.csrf, req.header('csrf-token'));
    next();
});

//////////////////////GOOGLE OAUTH HANDLING///////////////////////////////////////

exports.googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email'],
});

exports.googleAuthCallback = (req, res, next) => {
    //when request comes in call passport.auth which returns funciton, which we then call immediately with req, res,
    //next;
    passport.authenticate(
        'google',
        {
            failureRedirect: '/failed',
            successRedirect: '/',
            session: false,
        },
        async (err, user, info) => {
            const refreshTokenIsValid = await checkRefreshTokenOnLogin(
                req.cookies.jwtRefresh
            );
            //set req.user to create tokens. User comes from calling done(null, user)
            //in passport.js
            req.user = user;
            // console.log('USER', req.user);
            await createTokensAndCookies(req, res, next, refreshTokenIsValid);
            res.redirect('/');
        }
    )(req, res, next);
};
