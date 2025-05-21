const express = require('express');
const app = express();
const Listing = require('./models/listing'); // Assuming the model is in a folder named 'models'
const path = require('path')
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate')
const wrapAsync = require('./utils/WrapAsync.js')
const ExpressError = require('./utils/ExpressError.js')
const Review = require('./models/review'); // Assuming the model is in a folder named 'models'
const { reviewSchema } = require('./schema.js'); // Assuming the schema is in a folder named 'schemas'


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

// view route
app.get('/listings', wrapAsync(async (req, res) => {
    let allListings = await Listing.find();
    res.render('listing/index.ejs', { allListings });
}));

// New Route
app.get('/listings/new', (req, res) => {
    res.render('listing/new.ejs')
});

// Create Route
app.post('/listings', wrapAsync(async (req, res, next) => {
    // let { title, discription, image, price, location, country } = req.body;
    // if(!req.body.listing){
    //     throw new ExpressError(400, 'Invalid Listing Data');
    // }

    const newListing = new Listing(req.body.listing);

    if(!newListing.title || !newListing.description || !newListing.price || !newListing.location || !newListing.country) {
        throw new ExpressError(400, 'Invalid Listing Data');
    }
    await newListing.save();
    res.redirect('/listings');
}));

// show route
app.get('/listings/:id', wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate('reviews');
    // console.log(listing)
    res.render('listing/show.ejs', { listing });
}));

// Edit Route
app.get('/listings/:id/edit', wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id)
    res.render('listing/edit.ejs', { listing });
}));

// Update Route
app.put('/listings/:id', wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
    console.log(listing);
    res.redirect(`/listings/${listing._id}`);
}));

// Delete Route
app.delete('/listings/:id', wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);

    res.redirect('/listings')
}));


const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(400, msg);
    }
    else{
        next();
    }
}

// Add Review Route
app.post('/listings/:id/reviews', validateReview, wrapAsync(async (req, res) =>{
    let listing = await Listing.findById(req.params.id);
    let review = req.body.review;
    let newReview = new Review(review);

    listing.reviews.push(newReview._id);

    await newReview.save();
    await listing.save();
    console.log("Review Added");
    res.redirect(`/listings/${listing._id}`);
}));

// Delete Review Route
app.delete('/listings/:id/reviews/:reviewId', wrapAsync(async(req, res) => {
    let {id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);

    console.log("Review Deleted")
    res.redirect(`/listings/${id}`);
}));


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