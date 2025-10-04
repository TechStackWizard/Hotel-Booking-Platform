const Booking = require('../models/booking.js')
const Listing = require('../models/listing.js')


module.exports.booking = async (req, res) => {
    let { listId } = req.params;
    let listing = await Listing.findById(listId)
    res.render('listing/booking.ejs', { listing })
}

module.exports.createBooking = async (req, res, next) => {
    let { name, email, phone, checkin, checkout, guests, room, totalPrice } = req.body;
    // console.log(req.body);
    let { listId } = req.params;
    let booking = new Booking({
        name,
        email,
        phone,
        checkin,
        checkout,
        guests,
        room,
    })
    booking.totalPrice = totalPrice;
    booking.bookedBy = req.user._id;
    let listing = await Listing.findById(listId)
    booking.bookedHotel = listing;
    await booking.save();
    req.flash('success', 'Booking Successful! Please proceed to payment');
    // res.redirect(`/listings/${listId}/booking/orders`);
    res.redirect(`/orders`);
}

