// const mongoose = require('mongoose');
// const User = require('./userModel');
// const requireOwnerOrAdmin = require('./modelServices/requireOwnerOrAdmin');
// const AppError = require('../utils/appError');
// const Article = require('./articleModel');

// const commentSchema = new mongoose.Schema({
//     articleId: {
//         //if req.params.articleId undefined this will run
//         required: [true, 'Comment must be associated with an article'],
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Article',
//     },
//     owner: {
//         required: true,
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//     },
//     //articleId,
//     dateWritten: {
//         type: Date,
//         default: Date.now(),
//     },
//     commentText: {
//         type: String,
//         required: [true, 'Comment must contain text'],
//         minlength: 0,
//     },
//     votes: {
//         type: Number,
//         default: 0,
//         required: true,
//     },
//     dateUpdated: {
//         type: Date,
//     },
// });

// commentSchema.pre('save', async function (next) {
//     //save commentId into user object
//     await User.findOneAndUpdate(
//         { _id: this.owner },
//         { $push: { comments: this._id } }
//     );
//     next();
// });

// //run validators for all updates
// commentSchema.pre(/Update/, function (next) {
//     this.options.runValidators = true;
//     //add current date to dateUpdated property
//     this._update.dateUpdated = Date.now();
//     next();
// });

// commentSchema.pre('remove', async function (next) {
//     //remove references of votes or article itself from user object
//     const commentId = this._id;
//     const result = await User.updateMany(
//         {
//             $or: [
//                 { comments: commentId },
//                 { 'commentVotes.resourceId': commentId },
//             ],
//         },
//         {
//             $pull: {
//                 comments: commentId,
//                 commentVotes: { resourceId: commentId },
//             },
//         }
//     );
//     console.log(result);
//     next();
// });

// commentSchema.methods.requireOwnerOrAdmin = function (ownerId, userId, role) {
//     const ownerOrAdmin = requireOwnerOrAdmin(ownerId, userId, role);
//     if (ownerOrAdmin) return true;
//     return false;
// };

// const Comment = mongoose.model('Comment', commentSchema);

// module.exports = Comment;

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
