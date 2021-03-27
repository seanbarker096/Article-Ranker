// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const User = require('../models/userModel');

// passport.use(
//     new GoogleStrategy(
//         {
//             clientID: process.env.GOOGLE_CLIENT_ID,
//             clientSecret: process.env.GOOGLE_SECRET,
//             callbackURL: 'http://localhost:3000/api/v1/auth/google/callback',
//             proxy: true,
//         },
//         //this runs after we reach callback url and after passport susequently use auth code to
//         //get access token
//         async (accessToken, refreshToken, profile, done) => {
//             //create user
//             const { email, sub } = profile._json;
//             const userInfo = {
//                 email,
//                 name: profile.displayName,
//                 oauthId: sub,
//             };
//             //check if user exists but hasnt signed in with google before
//             let user = await User.findOne({ email });
//             if (!user) user = await User.create(userInfo);
//             else if (user && !user.oauthId) {
//                 user.oauthId = userInfo.oauthId;
//                 user.save();
//             }
//             done(null, user); //now get redirected to callback route handler
//         }
//     )
// );

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_SECRET,
            callbackURL: '/api/v1/auth/google/callback',
            proxy: true,
        },
        //this runs after we reach callback url and after passport susequently use auth code to
        //get access token
        async (accessToken, refreshToken, profile, done) => {
            //create user
            const { email, sub, name } = profile._json;
            const userInfo = {
                email,
                name,
                oauthId: sub,
            };
            //check if user exists but hasnt signed in with google before
            let user = await User.findOne({ email });
            if (!user) user = await User.create(userInfo);
            else if (user && !user.oauthId) {
                //if user with this email does exist but hasn't signed in
                //with google before, then just assign them an oauthId
                user.oauthId = userInfo.oauthId;
                user.save();
            }
            done(null, user); //now get redirected to callback route handler
        }
    )
);
