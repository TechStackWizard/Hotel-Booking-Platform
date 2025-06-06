const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js'); // Assuming the model is in a folder named 'models'


const MONGO_URI = 'mongodb://localhost:27017/havenlygo'; //

async function main(){
    await mongoose.connect(MONGO_URI);
}
main().then(()=>{
    console.log('Connected to MongoDB');
})
.catch(err => {
    console.log('Error connecting to MongoDB:', err);
})

const initDB = async () =>{
    await Listing.deleteMany({}).then(() => console.log('Data Deleted successfully')) // Clear the collection before inserting new data
    initData.data = initData.data.map((obj) => ({...obj, owner:'68346908a557fbf90559ffee'}));
    await Listing.insertMany(initData.data) // Insert the data from the data.js file
        .then(() => console.log('Data inserted successfully'))
        .catch(err => console.error('Error inserting data:', err))
}
initDB();



