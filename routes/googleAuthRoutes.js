const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('', authController.googleAuth);

router.get('/callback', authController.googleAuthCallback);

module.exports = router;
