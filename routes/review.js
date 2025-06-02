const express = require('express');
const router = express.Router({ mergeParams : true });
const wrapAsync = require('../utils/WrapAsync.js')
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware.js')

const reviewController = require('../controllers/review.js')


// Add Review Route
router.post('/', isLoggedIn, validateReview, wrapAsync(reviewController.addNewReview));



// Delete Review Route
router.delete('/:reviewId',isLoggedIn,isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;

