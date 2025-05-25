const express = require('express');
const router = express.Router();
const User = require('../models/user');


router.get('/signup',(req, res) => {
    res.render('user/signup.ejs')
})

router.post('/signup', async(req, res) => {
    let {username, email, password} = req.body;
    let newUser = new User({email, username});
    let registerUser = await User.register(newUser, password)
    console.log(registerUser);
    req.flash('success', "Welcome to HavelyGo");
    res.redirect('/listings')
})
module.exports = router;