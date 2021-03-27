const mongoose = require('mongoose');

const voteSchema = require('./voteSchema');

module.exports = mongoose.model('CommentVotes', voteSchema);
