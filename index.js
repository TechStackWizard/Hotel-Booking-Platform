const express = require('express');
const app = express();
const path = require('path')
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate')
const session = require('express-session');
const flash = require('connect-flash')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js')


const ExpressError = require('./utils/ExpressError.js')
const listingRoutes = require('./routes/listing.js'); // Assuming the routes are in a folder named 'routes'
const reviewRoutes = require('./routes/review.js'); // Assuming the routes are in a folder named 'routes'
const userRoutes = require('./routes/user.js')


const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://localhost:27017/havenlygo'; // Replace with your MongoDB URI


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, '/public')))

app.use(methodOverride('_method'))


// mongoose connection
main().then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.log('Error connecting to MongoDB:', err);
})
async function main() {
    await mongoose.connect(MONGO_URI);
}

// Root Route
app.get('/',(req,res)=>{
    res.send('Welcome to Havenlygo');
})

const sessionOptions = {
    secret:'secretkey',
    resave: false,
    saveUninitialized: true,

    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.use(session(sessionOptions))
app.use(flash())

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user;
    next();
})

// app.get('/registeruser', async(req, res) => {
//     let fakeUser = new User({
//         email: 'abc@gmail.com',
//         username: 'abc',
//     });

//     let registeredUser = await User.register(fakeUser, 'abcpass');
//     res.send(registeredUser);
// })

app.use('/listings', listingRoutes);
app.use('/listings/:id/reviews', reviewRoutes);
app.use('/', userRoutes);




// 404 Error Handling Middleware
// This middleware should be defined after all other routes
app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, 'Page Not Found'));
});

// default Error Handling Middleware
app.use((err, req, res, next) => {
    let { status = 501, message = 'Something went wrong' } = err;
    res.render('listing/error.ejs', {message, status})
});


app.listen(8080, () => {
    console.log('App is running...');
})