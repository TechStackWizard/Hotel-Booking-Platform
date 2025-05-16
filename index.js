const express = require('express');
const app = express();
const Listing = require('./models/listing'); // Assuming the model is in a folder named 'models'
const path = require('path')
const methodOverride = require('method-override');
const ejasMate = require('ejs-mate')

const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://localhost:27017/havenlygo'; // Replace with your MongoDB URI

app.set('view engin', 'views')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, '/public')))


app.use(methodOverride('_method'))
app.engine('ejs', ejasMate)


main().then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.log('Error connecting to MongoDB:', err);
})

async function main() {
    await mongoose.connect(MONGO_URI);
}

// view route
app.get('/listings', async (req, res) => {
    let allListings = await Listing.find();
    res.render('listing/index.ejs', { allListings })
})

// New Route
app.get('/listings/new', (req, res) => {
    res.render('listing/new.ejs')
});

// Create Route
app.post('/listings', async (req, res) => {
    // let { title, discription, image, price, location, country } = req.body;
    let newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect('/listings');
});

// show route
app.get('/listings/:id', async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id)
    // console.log(listing)
    res.render('listing/show.ejs', { listing })
});

// Edit Route
app.get('/listings/:id/edit', async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id)
    res.render('listing/edit.ejs', { listing })
})

// Update Route
app.put('/listings/:id', async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
    console.log(listing)
    res.redirect(`/listings/${listing._id}`)
});

// Delete Route
app.delete('/listings/:id', async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings')
})




app.listen(8080, () => {
    console.log('App is running...');
})