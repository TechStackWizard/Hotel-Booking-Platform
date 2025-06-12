const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const wrapAsync = require('../utils/WrapAsync.js')
const { isLoggedIn, isOwner, validateListing } = require('../middleware.js');
const listingController = require('../controllers/listings.js')

const multer = require('multer')
const { storage } = require('../cloudineryConfig.js')
const upload = multer({ storage })


// Search Route
router.route('/search')
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
        if(allListings.length == 0){
            req.flash('error',`No listing found for ${des}`)
            return res.redirect('/listings');
        }
        res.render('listing/index.ejs', { allListings });
    })

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
    .delete(isLoggedIn, isOwner, validateListing, wrapAsync(listingController.deleteListing));


module.exports = router;
