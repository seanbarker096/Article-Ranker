// const router = require('express').Router();
// const userController = require('../controllers/userController');
// const authController = require('../controllers/authController');
// const commentRouter = require('./commentRoutes');
// const articleRouter = require('./articleRoutes');

// router.use('/:userId/comments', commentRouter);
// router.use('/:userId/articles', articleRouter);
// //define before userId routes otherwise will interpret 'me' as id
// router
//     .route('/me')
//     .get(authController.protect, userController.getMe, userController.getUser)
//     .delete(
//         authController.protect,
//         userController.getMe,
//         userController.deleteUser
//     )
//     .patch(
//         authController.protect,
//         userController.getMe,
//         userController.updateUser
//     );

// //dont need to be signed in to view user profile
// router.route('/:id').get(userController.getUser);

// router.use(authController.protect, userController.requireAdmin);

// router.route('/').get(userController.getUsers);

// router
//     .route('/:id')
//     .delete(userController.requireAdmin, userController.deleteUser)
//     .patch(userController.updateUser);

// module.exports = router;

const router = require('express').Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const commentRouter = require('./commentRoutes');
const articleRouter = require('./articleRoutes');

router.use('/:userId/comments', commentRouter);
router.use('/:userId/articles', articleRouter);
//define before userId routes otherwise will interpret 'me' as id
router
    .route('/me')
    .get(authController.protect, userController.getMe, userController.getUser)
    .delete(
        authController.protect,
        authController.checkCsrfToken,
        userController.getMe,
        userController.deleteUser
    )
    .patch(
        authController.protect,
        authController.checkCsrfToken,
        userController.getMe,
        userController.updateUser
    );

router.get('/:id/activity', userController.getUserActivity);

router.get('/:id/stats', userController.getUserStats);
//dont need to be signed in to view user profile
router.route('/:id').get(userController.getUser);

router.use(authController.protect, userController.requireAdmin);

router.route('/').get(userController.getUsers);

router
    .route('/:id')
    .delete(
        authController.checkCsrfToken,
        userController.requireAdmin,
        userController.deleteUser
    )
    .patch(authController.checkCsrfToken, userController.updateUser);

module.exports = router;
