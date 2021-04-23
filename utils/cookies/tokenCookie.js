//class for creating cookies to store tokens (e.g. CSRF, JWT, JWT refresh)
class TokenCookie {
    constructor(cookieType) {
        this.issuer = process.env.APP_NAMME;
        this.cookieType = cookieType;
        //seperate options for each cookie in case need to differ
        const csrfExpiryTime = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const jwtExpiryTime = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const jwtRefreshExpiryTime = new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
        );
        if (this.cookieType === 'jwt') this.expires = jwtExpiryTime;
        if (this.cookieType === 'csrf') this.expires = csrfExpiryTime;
        if (this.cookieType === 'jwtRefresh')
            this.expires = jwtRefreshExpiryTime;

        this.cookieOptions = {
            httpOnly: true,
            sameSite: 'Lax',
            issuer: this.issuer,
            expires: this.expires,
            noTimestamp: false,
        };
    }

    create(req, res, token) {
        this.cookieOptions.secure =
            req.secure || req.header('x-forwarded-proto') === 'https';
        res.cookie(this.cookieType, token, this.cookieOptions);
    }

    delete(res) {
        res.cookie(this.cookieType, null, {
            ...this.cookieOptions,
            expires: new Date(Date.now() - 100000000000),
        });
    }
}

module.exports = TokenCookie;
