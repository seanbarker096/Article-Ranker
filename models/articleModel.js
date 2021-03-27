// /* eslint-disable prettier/prettier */
// /* eslint-disable prefer-arrow-callback */
// const mongoose = require('mongoose');
// const validator = require('validator');
// const AppError = require('../utils/appError');
// const requireOwnerOrAdmin = require('./modelServices/requireOwnerOrAdmin');
// const User = require('./userModel');
// const Comment = require('./commentModel');
// console.log(User);
// const articleSchema = new mongoose.Schema({
//     title: {
//         required: [true, 'Article must have a title'],
//         type: String,
//     },
//     author: {
//         required: [true, 'Article must have an author'],
//         type: String,
//     },
//     owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     dateUploaded: {
//         type: Date,
//         default: Date.now(),
//     },
//     tags: Array,
//     description: {
//         type: String,
//     },
//     url: {
//         required: [true, 'Article must be uploaded with a url'],
//         validator: [validator.isURL],
//         type: String,
//     },
//     votes: {
//         required: true,
//         default: 0,
//         type: Number,
//     },
// });

// //only async so we can catch the thrown error in some cases
// articleSchema.methods.requireOwnerOrAdmin = function (ownerId, userId, role) {
//     const ownerOrAdmin = requireOwnerOrAdmin(ownerId, userId, role);
//     if (ownerOrAdmin) return true;
//     return false;
// };

// articleSchema.pre('save', async function (next) {
//     //store article on users document
//     await User.findByIdAndUpdate(this.owner, {
//         $push: { articles: this._id },
//     });
//     next();
// });

// //find all other references to this document and remove them. 'remove' middleware
// //runs on delete queries
// articleSchema.pre('remove', async function (next) {
//     const articleId = this._id;
//     let commentId;
//     //remove all comments
//     const comment = await Comment.findOneAndRemove({ articleId: articleId });
//     if (comment) commentId = comment._id;

//     //remove all references to article and associated comments
//     const result = await User.updateMany(
//         {
//             //query optimization
//             $or: [
//                 { 'articleVotes.resourceId': articleId },
//                 { articles: articleId },
//                 { 'commentVotes.resourceId': commentId },
//                 { comments: commentId },
//             ],
//         },
//         {
//             $pull: {
//                 articleVotes: { resourceId: articleId },
//                 articles: articleId,
//                 commentVotes: { resourceId: commentId },
//                 comments: commentId,
//             },
//         }
//     );
//     console.log(result);
//     //remove all comments
//     next();
// });

// const Article = mongoose.model('Article', articleSchema);

// module.exports = Article;

/* eslint-disable prettier/prettier */
/* eslint-disable prefer-arrow-callback */
const mongoose = require('mongoose');
const validator = require('validator');
const requireOwnerOrAdmin = require('./modelServices/requireOwnerOrAdmin');
const Comment = require('./commentModel');
const ArticleVotes = require('./articleVotesModel');
const CommentVotes = require('./commentVotesModel');

//dont require User model yet, as User model needs Article Model to be created
//let User;
const articleSchema = new mongoose.Schema(
    {
        title: {
            required: [true, 'Article must have a title'],
            type: String,
        },
        author: {
            required: [true, 'Article must have an author'],
            type: String,
        },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        dateUploaded: {
            type: Date,
            default: Date.now(),
        },
        tags: {
            type: Array,
            default: null,
        },
        description: {
            type: String,
        },
        url: {
            required: [true, 'Article must be uploaded with a url'],
            validator: [validator.isURL],
            type: String,
        },
        // votes: {
        //     required: true,
        //     default: 0,
        //     type: Number,
        // },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

//only async so we can catch the thrown error in some cases
articleSchema.methods.requireOwnerOrAdmin = function (ownerId, userId, role) {
    const ownerOrAdmin = requireOwnerOrAdmin(ownerId, userId, role);
    if (ownerOrAdmin) return true;
    return false;
};

//document delete middleware for when article deleted. Deletes all comments, votes, and votes on the comments
articleSchema.pre(/^delete/, { query: true }, async function (next) {
    //remove all comments
    const articleId = this.getQuery()._id;
    const childComments = await Comment.find({ articleId });
    await Comment.deleteMany({ articleId });
    //remove all votes
    await ArticleVotes.deleteMany({ resourceId: articleId });
    //delete all votes associated with comments we are removing
    const deletedCommentIds = childComments.map((comment) => comment._id);
    //removte votes associated with children
    await Comment.deleteChildren(deletedCommentIds);
    next();
});

articleSchema.statics.populateChildrenAndParents = async function (
    numOfArticles = 1,
    queryObj = {}
) {
    //this refers to model
    const result = await this.aggregate([
        {
            //allows various queries (e.g. user articles, single article)
            $match: queryObj,
        },
        {
            $sort: { dateUploaded: -1 },
        },
        {
            $limit: numOfArticles,
        },
        {
            //populate owner of the articles
            $lookup: {
                from: User.collection.name,
                let: { owner: '$owner' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ['$$owner', '$_id'],
                            },
                        },
                    },
                    {
                        $project: {
                            password: 0,
                            email: 0,
                        },
                    },
                ],
                as: 'owner',
            },
        },
        {
            $unwind: '$owner',
        },
        {
            $lookup: {
                from: Comment.collection.name,
                let: { articleId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$$articleId', '$articleId'] },
                        },
                    },
                    { $sort: { date: -1 } },
                    { $limit: 15 },
                    //now populate users on these comments
                    {
                        $lookup: {
                            from: User.collection.name,
                            let: { userId: '$owner' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ['$_id', '$$userId'],
                                        },
                                    },
                                },
                                {
                                    $project: { password: 0 },
                                },
                            ],
                            as: 'owner',
                        },
                    },
                    { $unwind: '$owner' },
                    // {
                    //     $lookup: {
                    //         from: CommentVotes.collection.name,
                    //         let: { commentId: '$_id' },
                    //         pipeline: [
                    //             {
                    //                 $match: {
                    //                     $expr: {
                    //                         $eq: ['$resourceId', '$$commentId'],
                    //                     },
                    //                 },
                    //             },
                    //         ],
                    //         as: 'votes',
                    //     },
                    // },
                    // {
                    //     $addFields: {
                    //         votes: {
                    //             $cond: [
                    //                 { $gt: [{ $size: '$votes' }, 0] },
                    //                 { $arrayElemAt: ['$votes', 0] },
                    //                 null,
                    //             ],
                    //         },
                    //     },
                    // },
                ],
                as: 'comments',
            },
        },
        // {
        //     $lookup: {
        //         from: ArticleVotes.collection.name,
        //         let: { articleId: '$_id' },
        //         pipeline: [
        //             {
        //                 $match: {
        //                     $expr: { $eq: ['$resourceId', '$$articleId'] },
        //                 },
        //             },
        //             {
        //                 $project: { _id: 0, voters: 0, resourceId: 0, __v: 0 },
        //             },
        //         ],
        //         as: 'votes',
        //     },
        // },
        // {
        //     $addFields: {
        //         votes: {
        //             $cond: [
        //                 { $gt: [{ $size: '$votes' }, 0] },
        //                 { $arrayElemAt: ['$votes', 0] },
        //                 { $arrayElemAt: ['$votes', 0] },
        //                 null,
        //             ],
        //         },
        //     },
        // },
    ]);
    // console.log(result);
    return result;
};

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;

const User = require('./userModel');
