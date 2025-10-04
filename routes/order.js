const express = require('express');
const { isLoggedIn } = require('../middleware');
const crypto = require("crypto");
const Booking = require('../models/booking');
const Razorpay = require('razorpay');


const router = express.Router({ mergeParams: true });

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

router.get('/', isLoggedIn, async (req, res) => {
    let orders = await Booking.find({ bookedBy: req.user._id }).populate('bookedBy').populate('bookedHotel');
    res.render("user/orders.ejs", { orders, keyId: process.env.RAZORPAY_KEY_ID });

})

router.post("/pay/:id", isLoggedIn, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).send("Booking not found");
        console.log(booking);

        const options = {
            amount: booking.totalPrice * 100, // convert to paise
            currency: "INR",
            receipt: `receipt_order_${booking._id}`,
        };

        const order = await razorpay.orders.create(options);
        // const { listId } = req.params;
        // const listing = await Listing.findById(listId);
        // console.log(listing);

        res.json({
            order,
            booking,
            key_id: process.env.RAZORPAY_KEY_ID
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating Razorpay order");
    }
});

// Verify payment (after user pays)
router.post("/payment/verify", isLoggedIn, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

        const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
        shasum.update(razorpay_order_id + "|" + razorpay_payment_id);
        const digest = shasum.digest("hex");

        // const { listId } = req.params;
        // console.log(listId);

        if (digest === razorpay_signature) {
            // ✅ Update booking as paid
            await Booking.findByIdAndUpdate(bookingId, { isPaid: true });
            // ✅ Store a flash message (if using connect-flash)
            req.flash("success", "Payment successful! Booking confirmed.");

        } else {
            req.flash("error", "Payment verification failed!");
        }
        // Redirect back to orders page
        // return res.redirect(`/listings/${listId}/booking/orders`);
        return res.redirect(`/orders`);

    } catch (err) {
        console.error(err);
        req.flash("error", "Server error during payment verification");
        // res.redirect(`/listings/${listId}/booking/orders`);
        res.redirect(`/orders`);
    }
});

module.exports = router;
