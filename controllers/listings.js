const Listing = require('../models/listing.js')


module.exports.index = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate({path:'reviews', populate:{path:'author'}}).populate('owner');
    // console.log(listing)
    
    if(!listing){
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

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash('success', 'New Listing Created');
    res.redirect('/listings');
};