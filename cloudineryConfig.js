const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

cloudinary.config({ 
  cloud_name: process.env.CLOUDE_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET_KEY
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'havenlyGo_dev',
    aloowedformat: ['png','jpeg','jpg'] // supports promises as well
    },
});

module.exports = {
    cloudinary,
    storage,
}