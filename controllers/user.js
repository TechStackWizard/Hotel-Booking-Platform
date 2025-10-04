const User = require('../models/user');

module.exports.renderSignUp = (req, res) => {
    res.render('user/signup.ejs')
}

module.exports.renderLogin = (req, res) => {
    res.render('user/login.ejs')
}

module.exports.signUp = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        let newUser = new User({ email, username });
        let registerUser = await User.register(newUser, password)
        // console.log(registerUser);
        req.login(registerUser, (err) => {
            if (err) return next(err);
            req.flash('success', "Welcome to HavelyGo");
            res.redirect('/listings')
        })
    } catch (err) {
        console.log(err)
        req.flash('error', err.message);
        res.redirect('/signup')
    }
}

module.exports.login = async (req, res) => {
    req.flash('success', 'Wecome back to HavenlyGo!!');
    let requestUrl = res.locals.requestUrl || '/listings'
    res.redirect(requestUrl)
}


module.exports.logout = (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.flash('success', "You are logged out!")
        res.redirect('/listings')
    })
}

