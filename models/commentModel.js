/* eslint-disable prefer-arrow-callback */
const mongoose = require('mongoose');
const requireOwnerOrAdmin = require('./modelServices/requireOwnerOrAdmin');

const commentSchema = new mongoose.Schema({
    articleId: {
        //if req.params.articleId undefined this will run
        required: [true, 'Comment must be associated with an article'],
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
    },
    owner: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    //articleId,
    dateWritten: {
        type: Date,
        default: Date.now(),
    },
    commentText: {
        type: String,
        required: [true, 'Comment must contain text'],
        minlength: 1,
    },
    // votes: {
    //     type: Number,
    //     default: 0,
    //     required: true,
    // },
    dateUpdated: {
        type: Date,
    },
});

//post middleware to delete all votes associated with comment
commentSchema.pre(/^delete/, async function (res) {
    const commentId = this.getQuery()._id;
    await CommentVotes.deleteMany({ resourceId: commentId });
});

commentSchema.post('save', async function () {
    await this.populate({ path: 'owner' }).execPopulate();
});

commentSchema.statics.deleteChildren = async function (parentIds) {
    const res = await CommentVotes.deleteMany({
        resourceId: { $in: parentIds },
    });
    return res;
};
commentSchema.methods.requireOwnerOrAdmin = function (ownerId, userId, role) {
    const ownerOrAdmin = requireOwnerOrAdmin(ownerId, userId, role);
    if (ownerOrAdmin) return true;
    return false;
};

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
const CommentVotes = require('./commentVotesModel');
//const User = require('./userModel');
