const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    refreshTokenId: {
        type: String,
        required: [true, 'Must provide a refresh token id'],
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

//populdate middleware to get userId
refreshTokenSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name role',
    });
    next();
});

const RefreshToken = mongoose.model('refreshTokens', refreshTokenSchema);

module.exports = RefreshToken;
