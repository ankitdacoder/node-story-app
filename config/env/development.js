/*!
 * Module dependencies.
 */

var fs = require('fs');
var env = {};
    var envFile = __dirname + '/env_dev.json';
var cloudinary = require('cloudinary').v2;

// Read env.json file, if it exists, load the id's and secrets from that
// Note that this is only in the development env
// it is not safe to store id's in files

if (fs.existsSync(envFile)) {
    env = fs.readFileSync(envFile, 'utf-8');
    env = JSON.parse(env);
    Object.keys(env).forEach(function (key) {
        process.env[key] = env[key];
    });
}

// Global Config
/*var globalConfigData = {
    oneSignalId: "edb85c95-e249-4d3b-a930-f9d3703e95a8"
};*/
var globalConfigData = {
    oneSignalId: "d8dc2da4-b161-4cc8-9c9f-606be930da80",
    restKey : "MzlhNmIwZDMtNTg3Ni00NDkwLTllNjUtMWQ3MDgwODdmZTQ2"
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
