const express = require('express');
const router = express.Router();

const Listing = require('../models/listing'); 
const wrapAsync = require('../utils/WrapAsync.js')
const {listingSchema} = require('../schema.js');
const ExpressError = require('../utils/ExpressError.js')

// view route
router.get('/', wrapAsync(async (req, res) => {
    let allListings = await Listing.find();
    res.render('listing/index.ejs', { allListings });
}));


// New Route
router.get('/new', (req, res) => {
    res.render('listing/new.ejs')
});

// Validation Middleware (Joi package)
const validateListing = (req, res, next) => {
    const {error} = listingSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, msg);
    }
     else{
         next();
     }
};


// Create Route
router.post('/',validateListing, wrapAsync(async (req, res, next) => {
    // let { title, discription, image, price, location, country } = req.body;
    // if(!req.body.listing){
    //     throw new ExpressError(400, 'Invalid Listing Data');
    // }

    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash('success', 'New Listing Created');
    res.redirect('/listings');
}));


// show route
router.get('/:id', wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate('reviews');
    if(!listing){
        req.flash('error', 'Listing Not Found');
        return res.redirect('/listings');
    }
    res.render('listing/show.ejs', { listing });
}));


// Edit Route
router.get('/:id/edit', wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id)
    if(!listing){
        req.flash('error', 'Listing Not Found');
        return res.redirect('/listings');
    }
    res.render('listing/edit.ejs', { listing });
}));


// Update Route
router.put('/:id', wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
    req.flash('success', 'Listing Updated Successfully');
    res.redirect(`/listings/${listing._id}`);
}));


// Delete Route
router.delete('/:id', wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Listing Deleted Successfully');
    res.redirect('/listings')
}));

module.exports = router;