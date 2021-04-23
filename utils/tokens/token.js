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
        return await promisify(jwt.verify)(token, this.secretOrPrivateKey);
    }
}

module.exports = Token;
