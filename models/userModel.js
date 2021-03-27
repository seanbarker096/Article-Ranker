// const mongoose = require('mongoose');
// const validator = require('validator');
// const bcrypt = require('bcrypt');
// const AppError = require('../utils/appError');
// const voteSchema = require('./voteSchema');

// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: function () {
//             return !this.oauthId;
//         },
//     },
//     email: {
//         type: String,
//         required: [true, 'Must provide a email.'],
//         validate: [validator.isEmail, 'Please provide a valid email'],
//         unique: true,
//     },
//     password: {
//         type: String,
//         required: [
//             function () {
//                 return !this.oauthId;
//             },
//             'Please provide a password',
//         ],
//         minlength: 8,
//         //never send password to client
//         select: false,
//     },
//     passwordConfirmation: {
//         type: String,
//         required: [
//             function () {
//                 return !this.oauthId;
//             },
//             'Please provide a password confirmation',
//         ],
//         validate: {
//             validator: function (el) {
//                 return el === this.password;
//             },
//             message: 'Passwords must match',
//         },
//         select: false,
//     },
//     oauthId: {
//         type: String,
//     },
//     rank: Number,
//     signUpDate: Date,
//     passwordChangedAt: {
//         type: Date,
//     },
//     articleVotes: {
//         type: [voteSchema],
//         default: () => [],
//     },
//     commentVotes: {
//         type: [voteSchema],
//         default: () => [],
//     },
//     role: {
//         type: String,
//         enum: ['admin', 'user'],
//         default: 'user',
//     },
//     comments: [
//         {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Comment',
//         },
//     ],
//     articles: [
//         {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Article',
//         },
//     ],
//     //photo
// });

// //password hashing middleware
// userSchema.pre('save', async function (next) {
//     //only run in password has changed to one stored
//     if (!this.isModified('password')) return next();

//     this.password = await bcrypt.hash(this.password, 12);
//     //wont be persisted if undefined
//     this.passwordConfirmation = undefined;
//     next();
// });

// userSchema.pre(/^find/, function (next) {
//     this.populate({
//         path: 'comments',
//         select: '-author',
//     });
//     next();
// });

// userSchema.methods.correctPassword = async function (
//     submittedPassword,
//     userPassword
// ) {
//     //hash submitted password
//     return await bcrypt.compare(submittedPassword, userPassword);
// };

// userSchema.methods.changedPasswordAfter = function (tokenIssuedAt) {
//     let { passwordChangedAt } = this;
//     if (passwordChangedAt) {
//         passwordChangedAt = parseInt(passwordChangedAt.getTime() / 1000, 10);
//         console.log(tokenIssuedAt, passwordChangedAt);
//         return tokenIssuedAt < passwordChangedAt;
//     }
//     return false;
// };

// userSchema.methods.vote = async function (voteType, resourceId, voteVal) {
//     //check if have already voted
//     const newVotesArray = this[voteType];
//     const index = this[voteType].findIndex(
//         (x) => String(x.resourceId) === resourceId
//     );
//     //if have already voted on this resource...
//     if (index !== -1) {
//         const previousVote = newVotesArray[index].vote;
//         //if vote they submitted same as vote already and doesnt make it zero (i.e. we allow -1 -> 0 -> 1) made on this then throw error
//         if (voteVal + previousVote > 1 || voteVal + previousVote < -1) {
//             throw new AppError(
//                 'You have already voted in this way before!',
//                 400
//             );
//         } else if (voteVal + previousVote === 0) {
//             //if new vote causes zero total then remove resource record from user document
//             newVotesArray.splice(index, 1);
//         } else {
//             //otherwise replace values in array
//             const newVote = voteVal + previousVote;
//             newVotesArray[index].vote = newVote;
//         }
//         //submit vote and return true
//     } else {
//         newVotesArray.push({ resourceId, vote: voteVal });
//     }
//     //update child's properties (i.e the arrays) whcih will be persisted
//     //this[voteType] = newVotesArray;
//     await this.save();
// };

// const User = mongoose.model('User', userSchema);

// module.exports = User;

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const ArticleVotes = require('./articleVotesModel');
const AppError = require('../utils/appError');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: function () {
            return !this.oauthId;
        },
        minlength: 1,
    },
    email: {
        type: String,
        required: [
            function () {
                return !this.oauthId;
            },
            'You must provide an email',
        ],
        validate: [validator.isEmail, 'Please provide a valid email'],
        unique: true,
    },
    dateJoined: {
        type: Date,
        default: new Date(Date.now()),
    },
    password: {
        type: String,
        required: [
            function () {
                return !this.oauthId;
            },
            'Please provide a password',
        ],
        minlength: 8,
        //never send password to client
        select: false,
    },
    passwordConfirmation: {
        type: String,
        required: [
            function () {
                return !this.oauthId;
            },
            'Please provide a password confirmation',
        ],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords must match',
        },
        select: false,
    },
    oauthId: {
        type: String,
    },
    rank: Number,
    signUpDate: Date,
    passwordChangedAt: {
        type: Date,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
});

//password hashing middleware
userSchema.pre('save', async function (next) {
    //only run in password has changed to one stored
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    //wont be persisted if undefined
    this.passwordConfirmation = undefined;
    next();
});

//create virtual property for populating comments when we GET user(and also populate articles they are associated with)
userSchema.virtual('comments', {
    ref: 'Comment',
    foreignField: 'owner',
    localField: '_id',
});

//create virtual property for populating articles when we GET user
userSchema.virtual('articles', {
    ref: 'Article',
    foreignField: 'owner',
    localField: '_id',
});

userSchema.methods.populateChildren = async function () {
    //use nested loookup to get their articles and first 5 comments for each article
    const userId = mongoose.Types.ObjectId(this._id);
    const user = await this.constructor.aggregate([
        {
            $match: { _id: userId },
        },
        //remove fields dont want to send to client
        {
            $project: { password: 0 },
        },
        //get articles owned by this user
        {
            $lookup: {
                from: Article.collection.name,
                let: { owner: '$_id' },
                pipeline: [
                    {
                        //filter for articles only belonging to this user
                        $match: {
                            $expr: { $eq: ['$owner', '$$owner'] },
                        },
                    },
                    {
                        $limit: 10,
                    },
                    //add comments associated with this users articles
                    {
                        $lookup: {
                            from: Comment.collection.name,
                            let: { articleId: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ['$articleId', '$$articleId'],
                                        },
                                    },
                                },
                                //only get 3 comments per aticle
                                { $limit: 3 },
                            ],
                            as: 'comments',
                        },
                    },
                ],
                as: 'articles',
            },
        },
        //get comments written by user
        {
            $lookup: {
                from: Comment.collection.name,
                pipeline: [
                    {
                        $match: { owner: userId },
                    },
                    {
                        $limit: 10,
                    },
                    {
                        $sort: { date: -1 },
                    },
                ],
                as: 'comments',
            },
        },
    ]);

    return user[0];
};

userSchema.methods.correctPassword = async function (
    submittedPassword,
    userPassword
) {
    //hash submitted password
    return await bcrypt.compare(submittedPassword, userPassword);
};

//check to see if user has changed password after the last jwt token was issued.
//If this is the case, token will not be valid as user could have changed
//password as token was stolen.
userSchema.methods.changedPasswordAfter = function (tokenIssuedAt) {
    let { passwordChangedAt } = this;
    if (passwordChangedAt) {
        passwordChangedAt = parseInt(passwordChangedAt.getTime() / 1000, 10);
        return tokenIssuedAt < passwordChangedAt;
    }
    return false;
};

userSchema.statics.getActivity = async function (userId) {
    //get time series of votes and comments
    const filterDate = new Date();
    userId = mongoose.Types.ObjectId(userId);
    //only return votes in past year
    filterDate.setFullYear(filterDate.getFullYear() - 1);
    const monthFilter = new Date();
    monthFilter.setMonth(monthFilter.getMonth() - 1);
    const userActivity = await this.aggregate([
        {
            //need to convert to objectId in aggregation as mongo doesnt cast value automatically like
            //it does elsewhere
            $match: { _id: userId },
        },
        {
            $lookup: {
                from: ArticleVotes.collection.name,
                let: { filterDate, owner: '$_id' },
                pipeline: [
                    {
                        $match: {
                            voters: {
                                $elemMatch: {
                                    voterId: { $eq: userId },
                                    voteDate: { $gt: monthFilter },
                                },
                            },
                        },
                    },
                    {
                        $addFields: {
                            voters: {
                                $filter: {
                                    input: '$voters',
                                    as: 'voter',
                                    cond: {
                                        $and: [
                                            {
                                                $eq: [
                                                    '$$voter.voterId',
                                                    userId,
                                                ],
                                            },
                                            {
                                                $gt: [
                                                    '$$voter.voteDate',
                                                    filterDate,
                                                ],
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                    },
                ],
                as: 'voteDocs',
            },
        },
        {
            //only return the voters array, which will now only contain one entry
            //corresponding to the users vote
            $addFields: {
                userVotes: {
                    $map: {
                        input: '$voteDocs',
                        as: 'voteDoc',
                        in: {
                            $arrayElemAt: ['$$voteDoc.voters', 0],
                        },
                    },
                },
            },
        },
        {
            $project: { userVotes: 1 },
        },
        {
            $lookup: {
                from: Comment.collection.name,
                let: { owner: '$_id', filterDate },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$owner', '$$owner'] },
                                    { $gt: ['$dateWritten', '$$filterDate'] },
                                ],
                            },
                        },
                    },
                    {
                        //create day variable so can do calcs per day
                        $addFields: {
                            day: { $dayOfYear: '$dateWritten' },
                        },
                    },
                    {
                        $group: {
                            _id: '$day',
                            count: { $sum: 1 },
                        },
                    },
                    {
                        $project: {
                            dayOfTheYear: '$_id',
                            count: 1,
                            _id: 0,
                        },
                    },
                    {
                        $sort: {
                            day: -1,
                        },
                    },
                ],
                as: 'commentActivity',
            },
        },
    ]);
    if (!userActivity[0]) {
        throw new AppError('User does not exist', 400);
    }
    //get time series of comments
    return {
        voteActivity: userActivity[0].userVotes,
        commentActivity: userActivity[0].commentActivity,
    };
};

userSchema.statics.getUserStats = async function (userId) {
    const userStats = await this.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(userId) } },
        { $project: { _id: 1 } },
        //get average vote score for their comments
        {
            $lookup: {
                from: Comment.collection.name,
                let: { owner: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ['$owner', '$$owner'],
                            },
                        },
                    },
                ],
                as: 'comments',
            },
        },
        //get average vote score for their articles
        {
            $lookup: {
                from: Article.collection.name,
                let: { owner: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ['$owner', '$$owner'],
                            },
                        },
                    },
                ],
                as: 'articles',
            },
        },
        {
            //create array of votes
            $project: {
                votesArray: {
                    $map: {
                        input: '$articles',
                        in: '$$this.votes',
                    },
                },
                articles: true,
                comments: true,
            },
        },
        {
            //find article with max votes
            $project: {
                maxVoteArticle: {
                    $arrayElemAt: [
                        '$articles',
                        {
                            $indexOfArray: [
                                '$votesArray',
                                { $max: '$votesArray' },
                            ],
                        },
                    ],
                },
                averageArticleScore: { $avg: '$articles.votes' },
                articleCount: { $size: '$articles' },
                averageCommentScore: { $avg: '$comments.votes' },
                commentCount: { $size: '$comments' },
            },
        },
        {
            $project: {
                'maxVoteArticle.owner': 0,
            },
        },
    ]);
    if (!userStats[0]) {
        throw new AppError('User does not exist', 400);
    }
    return userStats;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

const Comment = require('./commentModel');
//due to circular reference between User and Article, require Article here so that it can be created using the User
//object created above
//Requiring after module.exports also means that when we create User inside articleModel.js, it wont already have a reference to Aritlce. It
//can therefore use the Article that will have just been created in articleModel.js
const Article = require('./articleModel');
