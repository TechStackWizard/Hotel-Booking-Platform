const express = require('express');
const router = express.Router();
const User = require('../models/user');
const WrapAsync = require('../utils/WrapAsync');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware');

const userController = require('../controllers/user.js')

router.route('/signup')
.get(userController.renderSignUp)
.post(WrapAsync(userController.signUpRequest));

router.route('/login')
.get(userController.renderLogin)
.post(saveRedirectUrl,
    passport.authenticate('local',
        {
            failureRedirect: '/login',
            failureFlash: true
        }),
        userController.login
    )

router.get('/logout', userController.logout)

module.exports = router;