// routes/payment.js
const express = require("express");

const bookingController = require('../controllers/booking.js');
const { isLoggedIn } = require("../middleware.js");
const review = require("../models/review.js");

const router = express.Router({ mergeParams: true });

router.route('/')
    .get(isLoggedIn, bookingController.booking)
    .post(isLoggedIn, bookingController.createBooking)


module.exports = router;
