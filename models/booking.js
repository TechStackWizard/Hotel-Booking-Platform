// models/Booking.js
const { boolean } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        match: [/.+\@.+\..+/, "Please enter a valid email"]
    },
    phone: {
        type: String,
        required: true
    },
    checkin: {
        type: Date,
        required: true
    },
    checkout: {
        type: Date,
        required: true
    },
    guests: {
        type: Number,
        required: true,
        min: 1
    },
    room: {
        type: String,
        enum: ["single", "double", "suite"],
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    bookedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    isPaid: {
        type: Boolean,
        default: false,
    },

    // This is not adding in bookings db
    bookedHotel: {
        type: Schema.Types.ObjectId,
        ref: 'Listing',
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual field: Calculate nights
bookingSchema.virtual("nights").get(function () {
    const diff = this.checkout - this.checkin;
    return diff / (1000 * 60 * 60 * 24); // days
});

// Before saving: auto-calculate price if not provided
bookingSchema.pre("validate", function (next) {
    const roomRates = {
        single: 10,
        double: 25,
        suite: 30
    };

    if (!this.totalPrice) {
        const nights = this.checkout > this.checkin
            ? (this.checkout - this.checkin) / (1000 * 60 * 60 * 24)
            : 1;
        this.totalPrice = nights * roomRates[this.room];
    }
    next();
});

module.exports = mongoose.model("Booking", bookingSchema);
