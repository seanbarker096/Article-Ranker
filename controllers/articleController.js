const Article = require('../models/articleModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getArticles = catchAsync(async (req, res, next) => {
    const articles = await Article.populateChildrenAndParents(15);
    res.status(200).json({
        status: 'success',
        data: {
            docs: articles,
        },
    });
});

exports.getArticle = catchAsync(async (req, res, next) => {
    let doc = await Article.findById(req.params.id);
    //get comments and extract result from aggregation pipeline array
    doc = await Article.populateChildrenAndParents(1, { _id: doc._id });
    if (!doc) return next(new AppError('Document does not exist', 400));
    res.status(200).json({
        status: 'success',
        data: {
            doc: doc,
        },
    });
});

exports.updateArticle = catchAsync(async (req, res, next) => {
    let doc = await Article.findById(req.params.id);
    if (!doc) {
        return next(
            new AppError('Cannot update document as it could not be found', 400)
        );
    }

    if (!doc.requireOwnerOrAdmin(doc.owner, req.user._id, req.user.role)) {
        return next(new AppError('You are not authorized to do this', 403));
    }
    //take out of array so can add keys to our mongoose document
    const populatedDoc = (
        await Article.populateChildrenAndParents(1, {
            _id: doc._id,
        })
    )[0];
    //console.log(populatedDoc);

    //update the values for keys based on updates sent from user
    Object.keys(req.body).forEach((key) => {
        doc[key] = req.body[key];
    });
    await doc.save();
    //now saved, create new plain javascript object so we cand replace objectIds with
    //actual documents without getting casting errors
    doc = doc.toObject();
    //update doc based on populateChildrenAndParents
    Object.keys(populatedDoc).forEach((key) => {
        doc[key] = populatedDoc[key];
    });
    res.status(200).json({
        status: 'success',
        data: {
            doc,
        },
    });
});

exports.deleteArticle = factory.deleteOne(Article, true);
exports.createArticle = factory.createOne(Article);
