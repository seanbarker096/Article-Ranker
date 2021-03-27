// const express = require('express');
// const authController = require('../controllers/authController');

// const router = express.Router();

// //for postman testing as can't get tokens via Google OAUTH
// router.post('/signin', authController.signIn);

// router.post('/signup', authController.signUp);

// router.get('/signout', authController.signOut);

// router.get(
//     '/refresh-token',
//     authController.checkCsrfToken,
//     authController.refreshJwt
// );

// router.patch(
//     '/updateMyPassword',
//     authController.protect,
//     authController.changePassword
// );

// //STILL NEED TO TEST PROTECT

// //oON LOGOUT NEED TO CLEAR ALL TOKENS INCLUDING CSRF TOKEN
// module.exports = router;

const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

//for postman testing as can't get tokens via Google OAUTH
router.post('/signin', authController.checkCsrfToken, authController.signIn);

router.post('/signup', authController.checkCsrfToken, authController.signUp);

router.get('/signout', authController.signOut);

router.get(
    '/refresh-token',
    //authController.checkCsrfToken,
    authController.refreshJwt
);

router.get('/csrf-token', authController.getCSRFToken);

router.patch(
    '/updateMyPassword',
    authController.protect,
    authController.checkCsrfToken,
    authController.changePassword
);

module.exports = router;
//STILL NEED TO TEST PROTECT

//oON LOGOUT NEED TO CLEAR ALL TOKENS INCLUDING CSRF TOKEN
