const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: 'drqsg1eyh',
  api_key: '617511363655179',
  api_secret: 'DSkVUg7jDYeDDa4Ls0UV4wrgXHk',
});

module.exports = cloudinary;