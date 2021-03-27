// /* eslint-disable no-useless-constructor */
// const crypto = require('crypto');
// const { promisify } = require('util');
// const Token = require('./token.js');
// //mongoose model
// const MongoRefreshToken = require('../../models/refreshTokenModel');
// const AppError = require('../appError.js');

// class RefreshToken extends Token {
//     constructor(secretOrPrivateKey, options) {
//         super(secretOrPrivateKey, options);
//     }

//     //first verify token signature. WIll throw error if expired
//     async verifyRefreshToken(token, login = false) {
//         try {
//             const decoded = await this.verify(token, this.secretOrPrivateKey);
//             //now user payload to validate vs our database
//             const refreshTokenDoc = await MongoRefreshToken.findOne({
//                 refreshTokenId: decoded.refreshTokenId,
//             });
//             if (!refreshTokenDoc) throw new Error();
//             return refreshTokenDoc;
//         } catch (err) {
//             console.log(err);
//             //if logging in then return false so createTokenAndCookies creates new token
//             if (login) {
//                 //if error due to expired token then create new one
//                 return false;
//             }
//             throw new AppError(
//                 'Refresh token is invalid. Please sign in to get a new one',
//                 401
//             );
//         }
//     }

//     async create(user) {
//         //dont need user info in refreshtoken. Just use random bytes we can look up in db
//         let refreshTokenId = (
//             await promisify(crypto.randomBytes)(254)
//         ).toString('hex');

//         refreshTokenId = crypto
//             .createHash('sha256')
//             .update(refreshTokenId)
//             .digest('hex');
//         //store in database
//         await MongoRefreshToken.create({
//             refreshTokenId: refreshTokenId,
//             owner: user._id,
//         });
//         //payload must be in object form
//         return await this.sign({ refreshTokenId });
//     }
// }

// module.exports = RefreshToken;

/* eslint-disable no-useless-constructor */
const crypto = require('crypto');
const { promisify } = require('util');
const Token = require('./token.js');
//mongoose model
const MongoRefreshToken = require('../../models/refreshTokenModel');
const AppError = require('../appError.js');

class RefreshToken extends Token {
    constructor(secretOrPrivateKey, options) {
        super(secretOrPrivateKey, options);
    }

    //If current token valid returns refreshtoken so we can use user id inside it. If logging in and no token returns false so can create new one.
    //Otherwise ask user to login again to get new one
    async verifyRefreshToken(token, login = false) {
        try {
            //first verify token signature. WIll throw error if expired
            const decoded = await this.verify(token, this.secretOrPrivateKey);

            //now use payload to check if its stored in our database
            const refreshTokenDoc = await MongoRefreshToken.findOne({
                refreshTokenId: decoded.refreshTokenId,
            });

            if (!refreshTokenDoc) throw new Error(); //throw error to run catch statement below
            return refreshTokenDoc;
        } catch (err) {
            if (login) {
                //if logging in then return false so createTokenAndCookies creates new token
                return false;
            }
            //if there is error in decoding then ask user to get new one
            throw new AppError(
                'Refresh token is invalid. Please sign in to get a new one',
                401
            );
        }
    }

    async create(user) {
        //dont want user info in refreshtoken as it will be long lasting. Just use random bytes we can look up in db. User it
        //is associated with will be stored in our database
        let refreshTokenId = (
            await promisify(crypto.randomBytes)(254)
        ).toString('hex');

        refreshTokenId = crypto
            .createHash('sha256')
            .update(refreshTokenId)
            .digest('hex');
        //store in database
        await MongoRefreshToken.create({
            refreshTokenId: refreshTokenId,
            owner: user._id,
        });
        //payload must be in object form
        return await this.sign({ refreshTokenId });
    }
}

module.exports = RefreshToken;
