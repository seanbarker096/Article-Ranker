// const express = require('express');
// const articleController = require('../controllers/articleController');
// const authController = require('../controllers/authController');
// const userController = require('../controllers/userController');
// const commentRoutes = require('./commentRoutes');

// const router = express.Router({ mergeParams: true });

// router.use('/:articleId/comments', commentRoutes);

// router.post(
//     '/:id/votes/:voteId',
//     authController.protect,
//     articleController.incrementVote
// );

// router.get(
//     '/myArticles',
//     authController.protect,
//     userController.getMe,
//     articleController.getArticles
// );

// router
//     .route('/')
//     .get(articleController.getArticles)
//     .post(authController.protect, articleController.createArticle);

// router
//     .route('/:id')
//     .get(articleController.getArticle)
//     .delete(authController.protect, articleController.deleteArticle)
//     .patch(authController.protect, articleController.updateArticle);

// module.exports = router;

const express = require('express');
const articleController = require('../controllers/articleController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const commentRoutes = require('./commentRoutes');
const articleVoteRoutes = require('./articleVoteRoutes');

const router = express.Router({ mergeParams: true });

//pass to commentRoute handler if trying to access comments on given article
router.use('/:articleId/comments', commentRoutes);
router.use('/votes', articleVoteRoutes);
router.use('/:id/votes', articleVoteRoutes);

router.get(
    '/myArticles',
    authController.protect,
    userController.getMe,
    articleController.getArticles
);

router
    .route('/')
    .get(articleController.getArticles)
    .post(
        authController.protect,
        authController.checkCsrfToken,
        articleController.createArticle
    );

router
    .route('/:id')
    .get(articleController.getArticle)
    .delete(
        authController.protect,
        authController.checkCsrfToken,
        articleController.deleteArticle
    )
    .patch(
        authController.protect,
        authController.checkCsrfToken,
        articleController.updateArticle
    );

module.exports = router;
