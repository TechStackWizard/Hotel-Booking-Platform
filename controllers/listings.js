const Listing = require('../models/listing.js')

module.exports.index = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('owner');
    // console.log(listing)

    if (!listing) {
        req.flash('error', 'Listing Not Found');
        return res.redirect('/listings');
    }
    res.render('listing/show.ejs', { listing });
};

module.exports.renderNewForm = (req, res) => {
    res.render('listing/new.ejs')
};

module.exports.createNewListing = async (req, res, next) => {
    // let { title, discription, image, price, location, country } = req.body;
    // if(!req.body.listing){
    //     throw new ExpressError(400, 'Invalid Listing Data');
    // }
    let { filename, path } = req.file;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url: path, filename }
    await newListing.save();
    req.flash('success', 'New Listing Created');
    res.redirect('/listings');
};

module.exports.editFormRender = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id)
    if (!listing) {
        req.flash('error', 'Listing Not Found');
        return res.redirect('/listings');
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace('/upload', '/upload/w_250')
    res.render('listing/edit.ejs', { listing, originalImageUrl });
};


module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });

    if (typeof req.file != 'undefined') {
        let { filename, path } = req.file;
        listing.image = { url: path, filename };
        await listing.save();
    }

    req.flash('success', 'Listing Updated Successfully');
    res.redirect(`/listings/${id}`);
}


module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Listing Deleted Successfully');
    res.redirect('/listings')
}

// module.exports.booking = async (req, res) => {
//     let { id } = req.params;
//     let listing = await Listing.findById(id)
//     res.render('listing/booking.ejs', { listing })
// }