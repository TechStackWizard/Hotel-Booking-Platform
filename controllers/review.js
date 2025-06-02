const Listing = require('../models/listing'); // Assuming the model is in a folder named 'models'
const Review = require('../models/review');

module.exports.addNewReview = async (req, res) =>{
    let listing = await Listing.findById(req.params.id);
    let review = req.body.review;
    let newReview = new Review(review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview._id);
    
    await newReview.save();
    await listing.save();
    req.flash('success', 'New Review Created');
    res.redirect(`/listings/${listing._id}`);
}

module.exports.deleteReview = async(req, res) => {
    let {id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);

    req.flash('success', 'Review Deleted Successfully');
    res.redirect(`/listings/${id}`);
};