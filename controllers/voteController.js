const ArticleVotes = require('../models/articleVotesModel');
const CommentVotes = require('../models/commentVotesModel');
const Article = require('../models/articleModel');
const Comment = require('../models/commentModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const getVotes = (Model) =>
    catchAsync(async (req, res) => {
        //querystring with array of Ids needs to be in format below
        // GET /shoes?color[]=blue&color[]=black&color[]=red
        const votes = await Model.getVotes(req.query, CommentVotes);
        res.status(200).json({
            status: 'success',
            data: {
                docs: votes,
            },
        });
    });

//define this in here so can use for both Article and Comment Votes
const incrementVote = (Model) =>
    catchAsync(async (req, res, next) => {
        let doc = await Model.findById(req.params.id);
        if (!doc) return next(new AppError('Resource does not exist', 400));
        if (doc.requireOwnerOrAdmin(doc.owner, req.user._id, req.user.role)) {
            return next(
                new AppError('You cannot vote on your own resource!', 403)
            );
        }
        let voteVal;
        //use voteId to get actual vote size
        if (parseInt(req.params.voteId, 10) === 1) {
            voteVal = 1;
        } else if (parseInt(req.params.voteId, 10) === 2) {
            voteVal = -1;
        } else {
            voteVal = 0;
        }
        //indentify the right field in user document to update
        let voteType;
        let voteRes;
        if (doc.constructor.modelName === 'Article') {
            voteType = 'articleVotes';
            voteRes = await ArticleVotes.vote(
                req.params.id,
                voteVal,
                req.user._id,
                voteType
            );
        }
        if (doc.constructor.modelName === 'Comment') {
            voteType = 'commentVotes';
            voteRes = await CommentVotes.vote(
                req.params.id,
                voteVal,
                req.user._id,
                voteType
            );
        }

        res.status(200).json({
            status: 'success',
            data: {
                doc: voteRes.voteDoc,
                votersVote: voteRes.votersVote,
                voterId: voteRes.voterId,
            },
        });
    });

exports.getCommentsVotes = getVotes(CommentVotes);

exports.getArticlesVotes = getVotes(ArticleVotes);

exports.incrementCommentsVotes = incrementVote(Comment);

exports.incrementArticlesVotes = incrementVote(Article);
