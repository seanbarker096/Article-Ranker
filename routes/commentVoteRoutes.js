const express = require('express');
const authController = require('../controllers/authController');
const voteController = require('../controllers/voteController');

const router = express.Router({ mergeParams: true });
router.route('/').get(voteController.getCommentsVotes);

router
    .route('/:voteId')
    .post(
        authController.protect,
        authController.checkCsrfToken,
        voteController.incrementCommentsVotes
    );

module.exports = router;
