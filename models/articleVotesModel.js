const mongoose = require('mongoose');

const voteSchema = require('./voteSchema');

module.exports = mongoose.model('ArticleVotes', voteSchema);
