var mongoose = require('mongoose');
var Notification = mongoose.model('Notification');
var utils = require('../../lib/utils');
var _ = require('underscore');

// Expose
exports.getNotifications = function(req, res, next) {
    /*var oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    createdAt: { $gte: oneWeekAgo },*/

    Notification
        .find({
            to: req.user._id,            
            seen: false
        })
        .populate({
            path: 'from',
            select: 'picture'
        })
        .populate({
            path: 'event',
            select: 'mood',
            populate: {
                path: 'mood',
                select : 'name'
            }
        })
        .sort('-createdAt')
        .exec(function(err, notifs) {
            if(err) return next(err);

            var notifType = {};
            notifType.event = ['NEW_EVENT', 'EVENT_UPDATED', 'EVENT_PARTICIPATION', 'EVENT_CANCELLED', 'ADD_COMMENT', 'ADD_PICTURE'];
            notifType.user = ['NEW_FRIEND', 'FRIENDS', 'FRIEND_REQUEST', 'TEAM_MOODUP', 'SAME_MOOD','FRIEND_REQUEST_REJECTED_SELF','FRIEND_REQUEST_REJECTED','FRIEND_SELF','FRIEND_REQUEST_SELF'];

            var all_notifi = [];
            _.each(notifs , function(noti){
                if(notifType.event.indexOf(noti.type) > -1) {
                    all_notifi.push({notif_id : noti._id,text : noti.text,notif_type : noti.type,event : noti.event.mood,createdAt : noti.createdAt,type : 2,event_id : noti.event._id});
                }else if (notifType.user.indexOf(noti.type) > -1) {
                    all_notifi.push({notif_id : noti._id,text : noti.text,notif_type : noti.type,user : {pic : noti.from.picture.imgUrl},createdAt : noti.createdAt,type : 1,user_id : noti.from._id});
                }
            })

            return res.json({
                status : 1,
                data: all_notifi
            });
        });
};

exports.setSeen = function(req, res, next) {
    req.checkBody('id').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    Notification
        .findByIdAndUpdate(req.body.id, { $set: { seen: true }}, function (err) {
            if(err) return next(err);

            return res.json({
                data: 'OK'
            });
        });
};

exports.setSeenAll = function(req, res, next) {
    req.checkBody('userId').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    var q = {
        to: req.body.userId,
        seen: false
    };

    var update = {
        seen: true
    };

    Notification.update(q, update, {multi: true}).exec(function(err, c) {
        if(err) return next(err);

        return res.json({
            data: 'OK'
        });
    });

    // Notification
    //     .findByIdAndUpdate(req.body.userId, { $set: { seen: true }}, function (err) {
    //         if(err) return next(err);

    //         return res.json({
    //             data: 'OK'
    //         });
    //     });
};