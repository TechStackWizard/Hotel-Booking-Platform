const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const wrapAsync = require('../utils/WrapAsync.js')
const { isLoggedIn, isOwner, validateListing } = require('../middleware.js');
const Booking = require("../models/booking.js");

const listingController = require('../controllers/listings.js')

const multer = require('multer')
const { storage } = require('../cloudineryConfig.js');
const { booking } = require('../controllers/booking.js');
const upload = multer({ storage })


// Search Route
router.route('/search/q')
    .get(async (req, res) => {
        let des = req.query.destination;
        if (!des) {
            req.flash('error', 'Please enter a search term');
            return res.redirect('/listings');
        }
        let allListings = await Listing.find({
            $or: [
                { country: { $regex: des, $options: 'i' } },
                { location: { $regex: des, $options: 'i' } }
            ]
        })
        if (allListings.length === 0) {
            req.flash('error', 'No listings found for that search term');
            return res.redirect('/listings');
        }
        res.render('listing/index.ejs', { allListings });
    })

// all Orders
router.get('/myOrders', isLoggedIn, wrapAsync(async (req, res) => {
    let orders = await Booking.find({ bookedBy: req.user._id }).populate('bookedBy').populate('bookedHotel');
    // console.log(orders);
    // res.send(orders);
    res.render("user/orders.ejs", { orders });
}))


// Show route
router
    .route('/')
    .get(wrapAsync(async (req, res) => {
        let allListings = await Listing.find();
        res.render('listing/index.ejs', { allListings });
    }))
    .post(isLoggedIn, validateListing, upload.single('listing[image]'), wrapAsync(listingController.createNewListing));

// New Route
router.get('/new', isLoggedIn, listingController.renderNewForm);

// Edit Route
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(listingController.editFormRender));

// Update Route
router.route('/:id')
    .get(wrapAsync(listingController.index))
    .put(isLoggedIn, isOwner, validateListing, upload.single('listing[image]'), wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));


module.exports = router;
