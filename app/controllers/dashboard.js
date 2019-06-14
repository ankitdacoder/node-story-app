var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('User');

exports.welcomeNote = function(req, res, next) {
    var note = fs.readFileSync(path.resolve('views/welcomeNote.html'), 'utf8');
    
        User.findOne({ _id : req.user._id }).exec(function(err, user) {
        if (err) return next(err);
        user.is_view = 1;
        user.save();   
    })

    return res.json({
        status : 1,
        data : note
    })
};

exports.getRewards = function(req, res, next) {
    User.findOne({ _id : req.user._id })
        .select('rewards')
        .exec(function(err, user) {
            if (err) return next(err);

            return res.json({
                status : 1,
                message : "User rewards.",
                data : user
            })
        })
};