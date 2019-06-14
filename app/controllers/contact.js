var mongoose = require('mongoose');
var Contact = mongoose.model('Contact');
var Feedback = mongoose.model('Feedback');
var config = require('../../config/config');
var cloudinary = config.cloudinary;
var fs = require('fs');

// Expose
exports.sendContact = function(req, res, next) {
    req.checkBody('text').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    var contactMessage = req.body;
    contactMessage.user = req.user._id;

    Contact(contactMessage).save(function(err) {
        if(err) return next(err);
        return res.json({
            data: 'OK'
        });
    });
};

exports.sendFeedback = function(req, res, next) {
    if(!Object.keys(req.body).length) return next(new Error('EMPTY_FEEDBACK'));

    Feedback({
        user: req.user._id,
        feedback: req.body
    }).save(function(err) {
        if(err) return next(err);

        return res.json({
            data: 'OK'
        });
    });
};


exports.uploadPicture = function(req, res, next) {
    if(!req.file.path) return new Error('FILE_UPLOAD_ERROR');

    cloudinary.uploader.upload(req.file.path, {
            format: "jpg"
        },
        function(err, image){
            // Image uploaded or not , lets delete the local one
            fs.unlink(req.file.path);

            if (err) return new Error('UPLOAD_ERROR');

            return res.json({
                type: 'success',
                data: {
                    imgId: image.public_id,
                    imgUrl: image.secure_url
                }
            });

        });
};