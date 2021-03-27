// const { promisify } = require('util');
// const jwt = require('jsonwebtoken');

// class Token {
//     constructor(secretOrPrivateKey, options) {
//         this.secretOrPrivateKey = secretOrPrivateKey;
//         this.options = options;
//     }

//     async sign(payload, signOptions = {}) {
//         const jwtSignOptions = { ...signOptions, ...this.options };
//         return await promisify(jwt.sign)(
//             payload,
//             this.secretOrPrivateKey,
//             jwtSignOptions
//         );
//     }

//     async verify(token) {
//         return await jwt.verify(token, this.secretOrPrivateKey);
//     }

//     // // refreshOptions.verify = options you would use with verify function
//     // // refreshOptions.jwtid = contains the id for the new token
//     // async refresh(token, refreshOptions = {}) {
//     //     //get current payload from current token
//     //     const payload = await this.verify(
//     //         token,
//     //         this.secretOrPublicKey,
//     //         refreshOptions.verify
//     //     );
//     //     delete payload.iat;
//     //     delete payload.exp;
//     //     delete payload.nbf;
//     //     delete payload.jti;
//     //     delete payload.iss; //We are generating a new token, if you are using jwtid during signing, pass it in refreshOptions

//     //     // use same payload but new token
//     //     return this.sign(payload);
//     // }
// }

// module.exports = Token;

const { promisify } = require('util');
const jwt = require('jsonwebtoken');

class Token {
    constructor(secretOrPrivateKey, options) {
        this.secretOrPrivateKey = secretOrPrivateKey;
        this.options = options;
    }

    async sign(payload, signOptions = {}) {
        const jwtSignOptions = { ...signOptions, ...this.options };
        return await promisify(jwt.sign)(
            payload,
            this.secretOrPrivateKey,
            jwtSignOptions
        );
    }

    async verify(token) {
        //verify using jwt module
        return await jwt.verify(token, this.secretOrPrivateKey);
    }
}

module.exports = Token;
