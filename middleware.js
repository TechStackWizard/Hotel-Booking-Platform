const Listing = require('./models/listing.js')
const Review = require('./models/review.js')
const { listingSchema } = require('./schema.js');
const ExpressError = require('./utils/ExpressError.js');
const { reviewSchema } = require('./schema.js');

module.exports.isLoggedIn = (req, res, next) => {

    if (!req.isAuthenticated()) {
        req.session.requestUrl = req.originalUrl;
        req.flash('error', "You must be login first!!");
        return res.redirect('/login')
    }
    next();
}


module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.requestUrl) {
        res.locals.requestUrl = req.session.requestUrl;
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash('error', "You are not a owner of this listing");
        return res.redirect(`/listings/${listing._id}`);
    }
    next();
}

// Validation Middleware (Joi package)
module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, msg);
    }
    else {
        next();
    }
};

// Validate Review Middleware
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(400, msg);
    }
    else {
        next();
    }
}


module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author._id.equals(res.locals.currUser._id)) {
        req.flash('error', "You are not an author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

// module.exports.validateListing = (req, res, next) => {
//     const {error} = listingSchema.validate(req.body);
//     if(error){
//         const msg = error.details.map(el => el.message).join(',');
//         throw new ExpressError(400, msg);
//     }
//      else{
//          next();
//      }
// };