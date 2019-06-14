var cloudinary = require('cloudinary').v2;

// Global Config
var globalConfigData = {
    oneSignalId: "edb85c95-e249-4d3b-a930-f9d3703e95a8"
};

cloudinary.config({
    cloud_name: 'kevinsuami',
    api_key: '198436635846379',
    api_secret: 'd8md96zASRgWcv82FgI3sa6dYIo'
});

/**
 * Expose
 */

module.exports = {
    db: process.env.MONGOLAB_URI,
    TOKEN_SECRET: process.env.TOKEN_SECRET,
    FACEBOOK_SECRET: process.env.FACEBOOK_SECRET,
    data: globalConfigData,
    cloudinary: cloudinary
};