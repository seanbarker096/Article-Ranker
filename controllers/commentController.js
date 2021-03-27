// const Comment = require('../models/commentModel');
// const factory = require('./handlerFactory');

// exports.getComments = factory.getMany(Comment, { limit: 10 });

// exports.createComment = factory.createOne(Comment);

// exports.updateComment = factory.updateOne(Comment, true);

// exports.deleteComment = factory.deleteOne(Comment, true);

// exports.incrementVote = factory.incrementVote(Comment);

const Comment = require('../models/commentModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getComments = factory.getMany(
    Comment,
    { limit: 10 },
    { path: 'articleId', select: 'title url author' }
);

exports.createComment = factory.createOne(Comment);

exports.updateComment = catchAsync(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
        return next(
            new AppError('Cannot update document as it could not be found', 400)
        );
    }
    if (
        !comment.requireOwnerOrAdmin(comment.owner, req.user._id, req.user.role)
    ) {
        return next(new AppError('You are not authorized to do this', 403));
    }

    comment.dateUpdated = Date.now();
    comment.commentText = req.body.commentText;
    await comment.save();
    res.status(200).json({
        status: 'success',
        data: {
            doc: comment,
        },
    });
});

exports.deleteComment = factory.deleteOne(Comment, true);
