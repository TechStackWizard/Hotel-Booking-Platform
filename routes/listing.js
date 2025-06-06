const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const wrapAsync = require('../utils/WrapAsync.js')
const { isLoggedIn, isOwner, validateListing } = require('../middleware.js');

const listingController = require('../controllers/listings.js')

const multer  = require('multer')
const {storage} = require('../cloudineryConfig.js')
const upload = multer({ storage })

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
    .put(isLoggedIn, isOwner, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));



module.exports = router;