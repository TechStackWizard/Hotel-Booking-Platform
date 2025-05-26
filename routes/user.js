const express = require('express');
const router = express.Router();
const User = require('../models/user');
const WrapAsync = require('../utils/WrapAsync');
const passport = require('passport')


router.get('/signup',(req, res) => {
    res.render('user/signup.ejs')
})

router.post('/signup', WrapAsync(async(req, res) => {
    try{
        let {username, email, password} = req.body;
        let newUser = new User({email, username});
        let registerUser = await User.register(newUser, password)
        console.log(registerUser);
        req.flash('success', "Welcome to HavelyGo");
        res.redirect('/listings')
    } catch(err){
        console.log(err)
        req.flash('error', err.message);
        res.redirect('/signup')
    }
}))

router.get('/login', (req, res) => {
    res.render('user/login.ejs')
})

router.post('/login', passport.authenticate('local', { failureRedirect: '/login' , failureFlash : true}), async(req, res) => {
    req.flash('success','Wecome back to HavenlyGo!!');
    res.redirect('/listings')
})

module.exports = router;