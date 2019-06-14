var mongoose = require('mongoose');
var Communication = mongoose.model('Communication');
var User = mongoose.model('User');
var notification = require('../../lib/notification');

// Expose
exports.getList = function(req, res, next) {
    Communication
        .find({})
        .sort('-createdAt') 
        .exec(function(err, list) {
        if(err) return next(err);
        return res.json({
            data: list
        });
    })
};

exports.add = function(req, res, next) {
    Communication({
        title: req.body.title,
        text: req.body.text,
        createdAt: new Date(),
        picture: req.body.picture
    }).save(function(err, c) {
        User.findOne({email: 'moodupteam@gmail.com'}, function(err, moodup) {
            if(err) return next(err);
            if(!moodup) return next(new Error('USER_NOT_FOUND'));

            notification.sendNotification(
                moodup,
                'ALL',
                "You've got a new message from Team MoodUP",
                {type: 'TEAM_MOODUP', data: c._id}
            );

            return res.json({
                message: 'OK'
            });

        });
    });
};