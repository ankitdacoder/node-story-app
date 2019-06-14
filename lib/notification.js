var mongoose = require('mongoose');
var User = mongoose.model('User');
var Notification = mongoose.model('Notification');
var config = require('../config/config');
var request = require('request');

var oneSignalPushUrl = 'https://onesignal.com/api/v1/notifications';

var notifType = {};
notifType.event = ['NEW_EVENT', 'EVENT_UPDATED', 'EVENT_PARTICIPATION', 'EVENT_CANCELLED', 'ADD_COMMENT', 'ADD_PICTURE'];
notifType.user = ['NEW_FRIEND', 'FRIENDS', 'FRIEND_REQUEST', 'TEAM_MOODUP', 'SAME_MOOD'];

exports.sendNotification = function(fromUser, toUsers, message, data){
    var q = {};
    if (toUsers == 'SAME_MOOD') {
        q.mood = fromUser.mood;
        q._id = {$in: fromUser.friends}
    } else if (toUsers != 'ALL') {
        q._id = {$in: toUsers};
    }

    User.find(q, 'pushDevices notifications', function(err, users) {

        if(err) return;
        if(!users.length) return;

        var canSendPushNotif = false;

        if (data.data == "571618392b94ec03005268a9" || data.data == "571618392b94ec04212378d0" || data.data == "571618392b94ec03012378c9"  || data.data == "571618392b94ec04212378b9" ) {
            if (fromUser && fromUser != undefined) {
                var fromAdmin =
                    fromUser._id == "56ddd3ad5a0dd70300f6bda4" // kevin moodup
                    || fromUser._id == "567b288737fa3b030066d28a" // kevin real
                    || fromUser._id == "567b278137fa3b030066d288" // riaz real
                    || fromUser._id == "56db2d6e293c280300d91c75" // riaz moodup
                    || fromUser._id == "568e5181ba59330300773332" // kelian real
                    || fromUser._id == "5696b4d91a46110300c40c75" // boris real
                    || fromUser._id == "56a7f4437897e70300e364ee" // Es'Thime
                    || fromUser._id == "567c5b31249ae60300646869" // diego real
                    || fromUser._id == "56a403d90971530300cccb58" // Maude Nicolas
                    // || fromUser._id == "5710bbddf18fe74d4dbc9389" // Gael
                    ? true : false;

                if (fromAdmin) canSendPushNotif = true;
                else canSendPushNotif = false;
            } else {
                canSendPushNotif = true; // no source, send to all
            }


            if (data.type == 'NEW_EVENT') canSendPushNotif = true;
        } else {
            canSendPushNotif = true;
        }

        // console.log("can push?", canSendPushNotif);

        if (canSendPushNotif) {

            saveNotification(fromUser, users, message, data);

            var uuidList = [];

            if(notifType.event.indexOf(data.type) > -1) {
                switch (data.type) {

                    case 'NEW_EVENT':
                        users.forEach( function(u) { if(u.notifications.events) uuidList = uuidList.concat(u.pushDevices) });
                        break;

                    case 'EVENT_UPDATED':
                    case 'EVENT_PARTICIPATION':
                    case 'EVENT_CANCELLED':
                        users.forEach( function(u) { if(u.notifications.events) uuidList = uuidList.concat(u.pushDevices) });
                        break;

                    case 'ADD_COMMENT':
                        users.forEach( function(u) { if(u.notifications.eventChat) uuidList = uuidList.concat(u.pushDevices) });
                        break;

                    case 'ADD_PHOTO':
                        users.forEach( function(u) { if(u.notifications.eventPhoto) uuidList = uuidList.concat(u.pushDevices) });
                        break;
                }
            } else if (notifType.user.indexOf(data.type) > -1) {
                switch (data.type) {

                    case 'FRIEND_REQUEST':
                        users.forEach( function(u) { if(u.notifications.friendRequests) uuidList = uuidList.concat(u.pushDevices) });
                        break;

                    case 'FRIENDS':
                    case 'NEW_FRIEND':
                    case 'SAME_MOOD':
                        users.forEach( function(u) { if(u.notifications.friends) uuidList = uuidList.concat(u.pushDevices) });
                        break;
                }
            }

            if(!uuidList.length) return;

            var dataPush = {
                "app_id": config.data.oneSignalId,
                "include_android_reg_ids": uuidList,
                "contents": {"en": message},
                "headings" : {"en": message},
                "data": data
            };
            request.post(
                {
                    url: oneSignalPushUrl,
                    body: dataPush,
                    json: true
                }, function(err, response, data) {
                /*console.log(JSON.stringify(response) + "<<<<<< notification data");*/
            });
        }
    })
};

function saveNotification(fromUser, toUsers, message, data) {
    var notif;

    for(var i = 0; i < toUsers.length; i++) {
        notif = {
            to: toUsers[i],
            from: fromUser,
            text: message,
            type: data.type,
            createdAt : new Date().getTime()
        };

        if(notifType.event.indexOf(data.type) > -1) { // notif de type event
            notif.event = data.data;
        }

        Notification(notif).save();
    }
}
