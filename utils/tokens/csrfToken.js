// /* eslint-disable no-useless-constructor */
// const crypto = require('crypto');
// const { promisify } = require('util');
// const Token = require('./token');
// const AppError = require('../appError');

// class CSRFToken extends Token {
//     constructor(secretOrPrivateKey, options) {
//         super(secretOrPrivateKey, options);
//     }

//     async verifyCsrfToken(token, csrfHeader) {
//         //first verify token signature
//         const decoded = await this.verify(token, this.secretOrPrivateKey);
//         //check against csrfHeader
//         if (decoded.csrf === csrfHeader) return true;
//         console.log(
//             `CSRF Tokens do not match for following token: /n ${token}`
//         );
//         throw new AppError('CSRF Tokens do not match', 400);
//     }

//     async create() {
//         let tokenVal = (await promisify(crypto.randomBytes)(254)).toString(
//             'hex'
//         );

//         tokenVal = crypto.createHash('sha256').update(tokenVal).digest('hex');
//         //payload must be in object form
//         return await this.sign({ tokenVal });
//     }
// }

// module.exports = CSRFToken;

/* eslint-disable no-useless-constructor */
const crypto = require('crypto');
const { promisify } = require('util');
const Token = require('./token');
const AppError = require('../appError');

//creates token will we be store in local storage on client side, and sent which each request to server inside a request header.
//As it is stored in local storage and then validated on backend, prevents Cross Site Request Forgery
class CSRFToken extends Token {
    constructor(secretOrPrivateKey, options) {
        super(secretOrPrivateKey, options);
    }

    async verifyCsrfToken(token, csrfHeader) {
        //first verify token signature which will have been sent in a httpOnly cookie
        let decoded;
        try {
            decoded = (await this.verify(token, this.secretOrPrivateKey))
                .csrfTokenVal;
        } catch (err) {
            throw new AppError('CSRF Token Verfication Error', 400);
        }
        //check against csrfHeader which will also contain token value
        if (decoded === csrfHeader) return true;
        throw new AppError('CSRF Tokens do not match', 400);
    }

    async create() {
        let csrfTokenVal = (await promisify(crypto.randomBytes)(254)).toString(
            'hex'
        );

        csrfTokenVal = crypto
            .createHash('sha256')
            .update(csrfTokenVal)
            .digest('hex');
        //payload must be in object form

        return { csrf: await this.sign({ csrfTokenVal }), csrfTokenVal };
    }
}

module.exports = CSRFToken;
