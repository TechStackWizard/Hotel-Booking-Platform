const express = require('express');
const app = express();
const Listing = require('./models/listing'); // Assuming the model is in a folder named 'models'
const path = require('path')
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate')
const wrapAsync = require('./utils/WrapAsync.js')
const ExpressError = require('./utils/ExpressError.js')


const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://localhost:27017/havenlygo'; // Replace with your MongoDB URI


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, '/public')))


app.use(methodOverride('_method'))


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
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect('/listings');
}));

// show route
app.get('/listings/:id', wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id)
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


// Error Handling Middleware
app.use((err, req, res, next) => {
    let {statusCode = 500, message= "Something went wrong"} = err;
    res.status(statusCode).send(message);
});


app.listen(8080, () => {
    console.log('App is running...');
})