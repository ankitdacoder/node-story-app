var mongoose = require('mongoose');
var Mood = mongoose.model('Mood');
var User = mongoose.model('User');
var utils = require('../../lib/utils');
var statistics = require('../../lib/statistic');
var notification = require('../../lib/notification');

// Expose

exports.getAllMoods = function(req, res, next) {
    Mood
        .find({})
        .sort({"position":1})
        .exec(function (err, moods) {
            if (err) return next(err);

            return res.json({
                status : 1,
                data: moods,
                message : "All moods"
            });
        })
}

exports.getMoods = function(req, res, next) {
    req.checkParams('action').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    var action = req.params.action;

    Mood
        .find({})
        .sort('position')
        .lean()
        .exec(function(err, moods) {
            if(err) return next(err);

            if(action == 'list') {
                User.aggregate({
                    $group: {
                        _id: "$mood",
                        total: {$sum: 1}
                    }}, function(err, moodCount){
                    if(err) return next(err);

                    for (var i = 0; i < moodCount.length; i++) {
                        var k = utils.findObjInArray(moods, '_id', moodCount[i]._id);
                        if(k != null) {
                            moods[k].total = moodCount[i].total;
                        }
                    }

                    return res.json({
                        data: moods,
                        message : ""
                    });
                });

            } else if(action == 'current') {
                var response = {};
                var k = utils.findObjInArray(moods, '_id', req.user.mood);

                if(k != null) {
                    response.mood = moods[k];
                    response.privacy = req.user.privacy;
                }

                return res.json({
                    data: response
                });
            }
        });
};

exports.setMood = function(req, res, next) {
    req.checkBody('moodId').notEmpty();
    req.checkBody('privacy').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    Mood.findById(req.body.moodId, function(err, m) {
        if(err) return next(err);
        if(!m) return next(new Error('MOOD_NOT_FOUND'));

        req.user.mood = m._id;
        req.user.privacy = req.body.privacy;
        req.user.available = 'today';

        req.user.save(function(err) {
            if(err) return next(err);

            statistics.changeMood(req.user, req.user.mood);

            notification.sendNotification(
                req.user,
                'SAME_MOOD',
                req.user.firstName + ' ' + req.user.lastName + " has the same mood as you!",
                {type: 'SAME_MOOD', data: req.user._id}
            );

            return res.json({
                message: 'Mood changed'
            });
        });

    });

};