// const AppError = require('../utils/appError');
// const catchAsync = require('../utils/catchAsync');
// const User = require('../models/userModel');

// exports.getOne = (Model, resultRequired = false) =>
//     catchAsync(async (req, res, next) => {
//         const doc = await Model.findById(req.params.id);
//         if (!doc && resultRequired)
//             return next(new AppError('Document does not exist', 400));

//         res.status(200).json({
//             status: 'success',
//             data: {
//                 doc,
//             },
//         });
//     });

// exports.getMany = (Model, queryOptions) =>
//     catchAsync(async (req, res, next) => {
//         const filter = {};
//         let doc;

//         //identify what the parent document is
//         if (req.params.userId) {
//             filter.owner = req.params.userId;
//         } else if (req.params.articleId) {
//             //get comments for article
//             filter.articleId = req.params.articleId;
//         }

//         if (filter) {
//             doc = await Model.find(filter, null, queryOptions);
//         } else {
//             doc = await Model.find(null, null, queryOptions);
//         }

//         res.status(200).json({
//             status: 'success',
//             data: {
//                 quantity: doc.length,
//                 doc,
//             },
//         });
//     });

// exports.deleteOne = (Model, requireOwner) =>
//     catchAsync(async (req, res, next) => {
//         const doc = await Model.findById(req.params.id);
//         if (!doc) {
//             return next(
//                 new AppError('Cannot delete as document was not found', 400)
//             );
//         }
//         if (requireOwner) {
//             if (
//                 !doc.requireOwnerOrAdmin(doc.owner, req.user._id, req.user.role)
//             ) {
//                 return next(
//                     new AppError('You are not authorised to do this', 403)
//                 );
//             }
//         }

//         await doc.remove();
//         res.status(204).json({
//             status: 'success',
//         });
//     });

// exports.createOne = (Model) =>
//     catchAsync(async (req, res, next) => {
//         let docContent = {};
//         if (req.params.articleId) {
//             docContent.articleId = req.params.articleId;
//         }
//         docContent = { ...docContent, ...req.body, owner: req.user._id };
//         const doc = await Model.create(docContent);
//         res.status(201).json({
//             status: 'success',
//             data: {
//                 doc,
//             },
//         });
//     });

// exports.updateOne = (Model, requireOwner) =>
//     catchAsync(async (req, res, next) => {
//         let doc;
//         if (requireOwner) {
//             doc = await Model.findById(req.params.id);
//             if (!doc)
//                 return next(
//                     new AppError(
//                         'Cannot update document as it could not be found',
//                         400
//                     )
//                 );
//             if (
//                 !doc.requireOwnerOrAdmin(doc.owner, req.user._id, req.user.role)
//             ) {
//                 return next(
//                     new AppError('You are not authorized to do this', 403)
//                 );
//             }
//             doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
//                 new: true,
//             });
//         } else {
//             doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
//                 new: true,
//             });
//         }
//         res.status(200).json({
//             status: 'success',
//             data: doc,
//         });
//     });

// exports.incrementVote = (Model) =>
//     catchAsync(async (req, res, next) => {
//         let doc = await Model.findById(req.params.id);
//         if (!doc) return next(new AppError('Resource does not exist', 400));
//         if (doc.requireOwnerOrAdmin(doc.owner, req.user._id, req.user.role)) {
//             return next(
//                 new AppError('You cannot vote on your own resource!', 403)
//             );
//         }
//         let voteVal;
//         if (parseInt(req.params.voteId, 10) === 1) {
//             voteVal = 1;
//         } else if (parseInt(req.params.voteId, 10) === 2) {
//             voteVal = -1;
//         } else {
//             voteVal = 0;
//         }
//         //indentify the right field in user document to update
//         let voteType;
//         if (doc.constructor.modelName === 'Article') {
//             voteType = 'articleVotes';
//         }
//         if (doc.constructor.modelName === 'Comment') {
//             voteType = 'commentVotes';
//         }

//         await req.user.vote(voteType, req.params.id, voteVal);
//         //update actual comment or article doc
//         doc = await Model.findByIdAndUpdate(
//             req.params.id,
//             {
//                 $inc: { votes: voteVal },
//             },
//             { new: true }
//         );
//         res.status(200).json({
//             status: 'success',
//             data: {
//                 doc,
//             },
//         });
//     });

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const ArticleVotes = require('../models/articleVotesModel');
const CommentVotes = require('../models/commentVotesModel');
const APIFeatures = require('../utils/apiFeatures');

exports.getOne = (Model, resultRequired = false, popOptions) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findById(req.params.id);
        if (!doc && resultRequired)
            return next(new AppError('Document does not exist', 400));
        if (popOptions) {
            await Model.populate(doc, popOptions);
        }
        res.status(200).json({
            status: 'success',
            data: {
                doc,
            },
        });
    });

exports.getMany = (Model, queryOptions, popOptions) =>
    catchAsync(async (req, res, next) => {
        const filter = {};
        //identify what the parent document is using url
        if (req.params.userId) {
            //for getting user articles or comments
            filter.owner = req.params.userId;
        } else if (req.params.articleId) {
            //get comments for article
            filter.articleId = req.params.articleId;
        }
        const features = new APIFeatures(Model.find(filter), req.query)
            .filter()
            .sort()
            .limit()
            .paginate();

        // //execute query
        const docs = await features.query;
        //have to user Model.populate as multiple results, not single docs
        if (popOptions) {
            await Model.populate(docs, popOptions);
        }
        res.status(200).json({
            status: 'success',
            data: {
                quantity: docs.length,
                docs,
            },
        });
    });

exports.deleteOne = (Model, requireOwner) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findById(req.params.id);
        if (!doc) {
            return next(
                new AppError('Cannot delete as document was not found', 400)
            );
        }
        if (requireOwner) {
            if (
                !doc.requireOwnerOrAdmin(doc.owner, req.user._id, req.user.role)
            ) {
                return next(
                    new AppError('You are not authorised to do this', 403)
                );
            }
        }

        await Model.deleteOne({ _id: doc._id });
        res.status(200).json({
            status: 'success',
            data: {
                doc,
            },
        });
    });

exports.createOne = (Model) =>
    catchAsync(async (req, res, next) => {
        let docContent = {};
        if (req.params.articleId) {
            docContent.articleId = req.params.articleId;
        }
        docContent = { ...docContent, ...req.body, owner: req.user._id };
        const doc = await Model.create(docContent);
        res.status(201).json({
            status: 'success',
            data: {
                doc,
            },
        });
    });

exports.updateOne = (Model, requireOwner) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findById(req.params.id);
        if (!doc) {
            return next(
                new AppError(
                    'Cannot update document as it could not be found',
                    400
                )
            );
        }
        if (requireOwner) {
            if (
                !doc.requireOwnerOrAdmin(doc.owner, req.user._id, req.user.role)
            ) {
                return next(
                    new AppError('You are not authorized to do this', 403)
                );
            }
        }
        Object.keys(req.body).forEach((key) => {
            doc[key] = req.body[key];
        });
        await doc.save();
        res.status(200).json({
            status: 'success',
            data: {
                doc,
            },
        });
    });
