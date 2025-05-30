const express = require('express');
const router = express.Router();
const Listing = require('../models/listing'); 
const wrapAsync = require('../utils/WrapAsync.js')
const {isLoggedIn, isOwner, validateListing} = require('../middleware.js')

// view route
router.get('/', wrapAsync(async (req, res) => {
    let allListings = await Listing.find();
    res.render('listing/index.ejs', { allListings });
}));


// New Route
router.get('/new',isLoggedIn, (req, res) => {
    res.render('listing/new.ejs')
});




// Create Route
router.post('/',isLoggedIn, validateListing, wrapAsync(async (req, res, next) => {
    // let { title, discription, image, price, location, country } = req.body;
    // if(!req.body.listing){
    //     throw new ExpressError(400, 'Invalid Listing Data');
    // }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash('success', 'New Listing Created');
    res.redirect('/listings');
}));


// show route
router.get('/:id', wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate('reviews').populate('owner');
    // console.log(listing)
    
    if(!listing){
        req.flash('error', 'Listing Not Found');
        return res.redirect('/listings');
    }
    res.render('listing/show.ejs', { listing });
}));


// Edit Route
router.get('/:id/edit',isLoggedIn, isOwner , wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id)
    if(!listing){
        req.flash('error', 'Listing Not Found');
        return res.redirect('/listings');
    }
    res.render('listing/edit.ejs', { listing });
}));


// Update Route
router.put('/:id',isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
    req.flash('success', 'Listing Updated Successfully');
    res.redirect(`/listings/${id}`);
}));


// Delete Route
router.delete('/:id',isLoggedIn, isOwner , wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Listing Deleted Successfully');
    res.redirect('/listings')
}));

module.exports = router;