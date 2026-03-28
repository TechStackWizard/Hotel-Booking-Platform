const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');
require('dotenv').config();

console.log("Mongo URI:", process.env.ATLAS_URL);
async function main() {
    await mongoose.connect(process.env.ATLAS_URL);
    console.log('Connected to MongoDB');

    await initDB(); // ✅ call after connection
}

main().catch(err => {
    console.log('Error connecting to MongoDB:', err);
});

const initDB = async () => {
    try {
        // await Listing.deleteMany({});
        // console.log('Old data deleted');

        // ✅ FIX HERE (choose correct one based on your export)
        await Listing.insertMany(initData.data || initData);

        console.log('Data inserted successfully');
    } catch (err) {
        console.error('Error inserting data:', err);
    }
};