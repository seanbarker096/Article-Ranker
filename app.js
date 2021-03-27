// const express = require('express');
// const passport = require('passport');
// const cookieParser = require('cookie-parser');
// const authRouter = require('./routes/authRoutes');
// const googleAuthRouter = require('./routes/googleAuthRoutes');
// const userRouter = require('./routes/userRoutes');
// const commentRouter = require('./routes/commentRoutes');
// const articleRouter = require('./routes/articleRoutes');
// require('./services/passport.js');
// const globalErrorHandler = require('./controllers/errorController');

// const app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// app.use(passport.initialize());

// app.use('/api/v1/auth', authRouter);
// app.use('/api/v1/auth/google', googleAuthRouter);
// app.use('/api/v1/users', userRouter);
// app.use('/api/v1/comments', commentRouter);
// app.use('/api/v1/articles', articleRouter);

// app.use(globalErrorHandler);

// module.exports = app;

const express = require('express');
const passport = require('passport');
const path = require('path');
// const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitise = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/authRoutes');
const googleAuthRouter = require('./routes/googleAuthRoutes');
const userRouter = require('./routes/userRoutes');
const commentRouter = require('./routes/commentRoutes');
const articleRouter = require('./routes/articleRoutes');
const votesRouter = require('./routes/articleVoteRoutes');
const globalErrorHandler = require('./controllers/errorController');
require('./services/passport.js');

const app = express();
//sets http headers for security
app.use(helmet());
app.use(cors());
//handle pre-flight requests for all routes
app.options('*', cors());

// if (process.env.NODE_ENV === 'development') {
//     app.use(morgan('dev'));
// }

//allows our app to parse post request forms into JSON objects. Adds data to req.body
app.use(express.json());
//allows app to parse post requests where the parameters are encoded in the url. Adds data to req.body
app.use(express.urlencoded({ extended: true }));
//adds cookie data to req.cookies
app.use(cookieParser());

//sanitise against NoSQL query injection
app.use(mongoSanitise());
//sanitisation against cross site scripting
//data sanitization against xss
app.use(xss());

app.use(passport.initialize());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/auth/google', googleAuthRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/articles', articleRouter);

app.use(globalErrorHandler);

//if havent found route match then serve either file in build folder
//otherwise serve up index.html (e.g. when they try to access a react-router route)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('frontend/build'));

    app.get('*', (req, res) => {
        res.sendFile(
            path.resolve(__dirname, '../', 'frontend', 'build', 'index.html')
        );
    });
}
module.exports = app;
