// const express = require('express');
// const commentController = require('../controllers/commentController');
// const authController = require('../controllers/authController');
// const userController = require('../controllers/userController');

// const router = express.Router({ mergeParams: true });

// router.post(
//     '/:id/votes/:voteId',
//     authController.protect,
//     commentController.incrementVote
// );

// router.get(
//     '/myComments',
//     authController.protect,
//     userController.getMe,
//     commentController.getComments
// );

// router
//     .route('/')
//     .post(authController.protect, commentController.createComment)
//     .get(commentController.getComments);

// //for admins to adjust comments
// router
//     .route('/:id')
//     .patch(authController.protect, commentController.updateComment)
//     .delete(authController.protect, commentController.deleteComment);

// module.exports = router;

const express = require('express');
const commentController = require('../controllers/commentController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const commentVoteRouter = require('./commentVoteRoutes');
//allows us to access parameters in the url from other routeHandlers e.g. in the case of articles/articleId/comments
const router = express.Router({ mergeParams: true });
router.use('/votes', commentVoteRouter);
router.use('/:id/votes', commentVoteRouter);
router.get(
    '/myComments',
    authController.protect,
    userController.getMe,
    commentController.getComments
);

router
    .route('/')
    .post(
        authController.protect,
        authController.checkCsrfToken,
        commentController.createComment
    )
    .get(commentController.getComments);

//for admins to adjust comments
router
    .route('/:id')
    .patch(
        authController.protect,
        authController.checkCsrfToken,
        commentController.updateComment
    )
    .delete(
        authController.protect,
        authController.checkCsrfToken,
        commentController.deleteComment
    );

module.exports = router;
