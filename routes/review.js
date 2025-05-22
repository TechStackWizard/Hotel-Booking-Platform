const express = require('express');
const router = express.Router({ mergeParams : true });

const Listing = require('../models/listing'); // Assuming the model is in a folder named 'models'
const Review = require('../models/review'); // Assuming the model is in a folder named 'models'
const wrapAsync = require('../utils/WrapAsync.js')
const ExpressError = require('../utils/ExpressError.js')
const { reviewSchema } = require('../schema.js');



// Validate Review Middleware
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
router.post('/', validateReview, wrapAsync(async (req, res) =>{
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
router.delete('/:reviewId', wrapAsync(async(req, res) => {
    let {id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);

    console.log("Review Deleted")
    res.redirect(`/listings/${id}`);
}));

module.exports = router;

