const express = require('express');
const app = express();
const path = require('path')
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate')

const ExpressError = require('./utils/ExpressError.js')
 // Assuming the model is in a folder named 'models'
 // Assuming the schema is in a folder named 'schemas'
const listingRoutes = require('./routes/listing.js'); // Assuming the routes are in a folder named 'routes'
const reviewRoutes = require('./routes/review.js'); // Assuming the routes are in a folder named 'routes'


const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://localhost:27017/havenlygo'; // Replace with your MongoDB URI


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, '/public')))


app.use(methodOverride('_method'))

// mongoose connection
main().then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.log('Error connecting to MongoDB:', err);
})
async function main() {
    await mongoose.connect(MONGO_URI);
}

// Root Route
app.get('/',(req,res)=>{
    res.send('Welcome to Havenlygo');
})

app.use('/listings', listingRoutes);
app.use('/listings/:id/reviews', reviewRoutes);



// 404 Error Handling Middleware
// This middleware should be defined after all other routes
app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, 'Page Not Found'));
});

// default Error Handling Middleware
app.use((err, req, res, next) => {
    let { status = 501, message = 'Something went wrong' } = err;
    res.render('listing/error.ejs', {message, status})
});


app.listen(8080, () => {
    console.log('App is running...');
})