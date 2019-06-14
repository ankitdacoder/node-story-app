var mongoose = require('mongoose');
var Mood = mongoose.model('Mood');
var Event = mongoose.model('Event');
var Activity = mongoose.model('Activity');
var Notification = mongoose.model('Notification');
var User = mongoose.model('User');
var Group = mongoose.model('Group');
var utils = require('../../lib/utils');
var config = require('../../config/config');
var cloudinary = config.cloudinary;
var fs = require('fs');
var _ = require('underscore');
var async = require('async');
var notification = require('../../lib/notification');
var Logs = require('../../lib/logs');
var path = require("path");
// Expose

var multer  =   require('multer');
var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
    }
});
//var upload = multer({ storage : storage }).array('userPhoto',2);

exports.uploadMedia = function(req, res, next) {
    var multer  = require('multer');
    var upload = multer({ storage : storage }).single('file');

    upload(req,res,function(err) {

        if(err) {
            return res.end("Error uploading file.");
        }

        cloudinary.uploader.upload(req.file.path, { resource_type: "auto" },
        function(err, media){

                fs.unlink(req.file.path);

                if (err) return new Error('UPLOAD_ERROR');

                return res.json({
                    type: 'success',
                    data: {
                        mediaId: media.public_id,
                        mediaUrl: media.secure_url
                    }
                });
            })


        //res.end("File is uploaded");
    });
    //console.log("called >>>> " + JSON.stringify(req.file));

    //if(!req.file.path) return new Error('FILE_UPLOAD_ERROR');

   /* if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    cloudinary.uploader.upload(req.file.path, {
            format: "jpg",
            width: 1024,
            height: 1024,
            crop: "fill"
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

        });*/
};

exports.uploadPicture = function(req, res, next) {
    if(!req.file.path) return new Error('FILE_UPLOAD_ERROR');

    cloudinary.uploader.upload(req.file.path, {
            format: "jpg",
            width: 1024,
            height: 1024,
            crop: "fill"
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

exports.uploadGalleryPicture = function(req, res, next) {
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
            })
        });
};

exports.shareEvent = function(req, res, next) {
    req.checkBody('title').notEmpty();
    // req.checkBody('description').notEmpty();
    req.checkBody('startingDate').notEmpty();
    req.checkBody('endingDate').notEmpty();
    req.checkBody('location').notEmpty();
    req.checkBody('invited').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    var event = req.body;
    event.author = req.user._id;

    Event(event).save(function(err, e) {
        if(err) return next(err);

        notification.sendNotification(
            req.user,
            e.invited.map(function(u) {return u.user}),
            req.user.firstName + " wants to share a moment with you. Are you UP for it?",
            {type: 'NEW_EVENT', data: e._id}
        );

        return res.json({
            message: 'EVENT_CREATED',
            data: e.toObject()
        });
    });
};

exports.updateEvent = function(req, res, next) {
    req.checkBody('_id').notEmpty();
    req.checkBody('title').notEmpty();
    // req.checkBody('description').notEmpty();
    req.checkBody('startingDate').notEmpty();
    req.checkBody('endingDate').notEmpty();
    req.checkBody('location').notEmpty();
    req.checkBody('invited').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    Event.findOne({
        _id: req.body._id
        //status: 'created'
    })
        .exec(function(err, event) {
            if(err) return next(err);
            if(!event) return next();

            if(event.author+'' != ''+req.user._id) return next(new Error('USER_NOT_AUTHOR_EVENT'));

            event.title = req.body.title;
            event.description = req.body.description;
            event.startingDate = req.body.startingDate;
            event.endingDate = req.body.endingDate;
            event.location = req.body.location;
            event.picture = req.body.picture;
            event.invited = req.body.invited;

            event.save(function(err) {
                if(err) return next(err);

                notification.sendNotification(
                    req.user,
                    event.invited.map(function(u) {return u.user}),
                    req.user.firstName + " edited the moment",
                    {type: 'EVENT_UPDATED', data: event._id}
                );

                return res.json({
                    data: 'OK'
                });
            });

        });
};

exports.getCalendar = function(req, res, next) {
    var q = {
        $or: [
            {author: req.user._id}, // auteur de l'event
            {$and: [
                {'invited.status': 1}, // participe a l'event
                {'invited.user': req.user._id}
            ]}
        ],
        status: 'created'
    };

    var limit = req.query.limit ? req.query.limit : 20;
    var from = req.query.from ? req.query.from : 0;


    Event
        .find(q)
        .limit(limit)
        .skip(req.query.from)
        .sort('-startingDate')
        .populate('mood')
        .populate({ 
            path: 'invited.user',
            select: 'firstName lastName fbId mood picture',
            populate: {
                path: 'mood',
                model: 'Mood'
            }
        }) 
        .populate({ 
            path: 'author',
            select: 'firstName lastName fbId mood picture',
            populate: {
                path: 'mood',
                model: 'Mood'
            }
        })
        .lean()
        .exec(function(err, events) {
            if(err) return next(err);

            events.forEach(function (e) {
                var now = new Date().getTime();
                var eventTime = new Date(e.endingDate).getTime();
                e.isDone = now - eventTime > 0 ? true : false;
            })

            // console.log(typeof events, events);

            return res.json({
                data: events
            });
        });
};

exports.getEvent = function(req, res, next) {
    req.checkParams('id').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    Event.findOne({_id: req.params.id})
        .populate('mood')
        .populate({ 
            path: 'invited.user',
            select: 'firstName lastName fbId mood picture',
            populate: {
                path: 'mood',
                model: 'Mood'
            }
        }) 
        .populate({ 
            path: 'author',
            select: 'firstName lastName fbId mood picture',
            populate: {
                path: 'mood',
                model: 'Mood'
            }
        })
        .lean()
        .exec(function(err, event) {
            if(err) return next(err);
            if(!event) return next();

            var now = new Date().getTime();
            var eventTime = new Date(event.endingDate).getTime();
            event.isDone = now - eventTime > 0 ? true : false;

            return res.json({
                data: event
            });
        });
};

exports.setParticipation = function(req, res, next) {    
    req.checkBody('isGoing').notEmpty();
    req.checkBody('activityId').notEmpty();
    req.checkBody('notif_id').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    Activity.findOne({
        _id: req.body.activityId
    })
        .exec(function(err, event) {
            if(err) return next(err);
            if(!event) return next();

            var k = utils.findObjInArray(event.invited, 'user', req.user._id);
            if(k == null) return next();

            event.invited[k].status = req.body.isGoing ? 1 : 2;

            var data = event.invited_groups;
            if(data.length){
                data.map(function(groups) {                                 
                    groups.users.map(function(user) {                                                            
                            if ((user.user).toString() === (req.user._id).toString()){
                                user.status = req.body.isGoing ? 1 : 2;  
                                //.log(user.status);
                            }
                    });
                });         
            }            
            
            if(data.length){    
                event.invited_groups = data;
            }

            event.save(function(err, e) {
                if(err) return next(err);

                var msg = req.user.firstName;

                if(req.body.isGoing) {
                    msg += ' will share a moment with you';
                } else {
                    msg += ' can not join today';
                }

                
                Notification.findByIdAndUpdate(req.body.notif_id, { $set: { seen: true }}).exec(function(err, event) {
                });

                notification.sendNotification(
                    req.user,
                    [event.author],
                    msg,
                    {type: 'EVENT_PARTICIPATION', data: e._id}
                );

                return res.json({
                    status : 1,
                    message : "Success"
                });
            });
        });
};


exports.cancelEvent = function(req, res, next) {
    req.checkParams('id').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    Event.findOne({
        _id: req.params.id
    })
        .exec(function(err, event) {
            if(err) return next(err);
            if(!event) return next();

            if(event.author+'' != req.user._id+'') return next(new Error('USER_NOT_AUTHOR_EVENT'));

            event.status = 'cancelled';

            event.save(function(err, e) {
                if(err) return next(err);

                notification.sendNotification(
                    req.user,
                    e.invited.map(function(u) {return u.user}),
                    req.user.firstName + " cancelled the moment",
                    {type: 'EVENT_CANCELLED', data: event._id}
                );

                return res.json({
                    data: 'OK'
                });
            });

        });
};

exports.getComments = function(req, res, next) {
    req.checkParams('id').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    Event
        .findOne({_id: req.params.id})
        .populate({ 
            path: 'comments.user',
            select: 'firstName lastName fbId mood picture',
            populate: {
                path: 'mood',
                model: 'Mood'
            }
        })
        .exec(function(err, event) {
            if(err) return next(err);
            if(!event) return next();

            return res.json({
                message: 'OK',
                data: event.comments
            });

        });
};

exports.getGallery = function(req, res, next) {
    req.checkParams('id').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    Event.findOne({_id: req.params.id})
        .populate({ 
            path: 'gallery.user',
            select: 'firstName lastName fbId mood picture',
            populate: {
                path: 'mood',
                model: 'Mood'
            }
        }) 
        .exec(function(err, event) {
            if(err) return next(err);
            if(!event) return next();

            return res.json({
                message: 'OK',
                data: event.gallery
            });

        });
};

exports.postComment = function(req, res, next) {
    req.checkBody('comment').notEmpty();
    req.checkBody('eventId').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    Event.findOne({
        _id: req.body.eventId
        //status: 'created'
    })
        .exec(function(err, event) {
            if(err) return next(err);
            if(!event) return next();

            event.comments.push({
                message: req.body.comment,
                user: req.user._id
            });

            event.save(function(err, e) {
                if(err) return next(err);

                notification.sendNotification(
                    req.user,
                    e.invited.map(function(u) {if(u.status == 1 && u.user+'' != ''+req.user._id) return u.user}),
                    req.user.firstName + " commented on " + event.title,
                    {type: 'ADD_COMMENT', data: e._id}
                );

                var logData = {
                    user: req.user._id,
                    action: 'NEW_MSG',
                    state: 'MOMENT_CHAT'
                }

                Logs.saveLogFromUser(logData);

                return res.json({
                    data: 'OK'
                });
            });
        });
};


exports.postPicture = function(req, res, next) {
    req.checkBody('picture').notEmpty();
    req.checkBody('eventId').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    Event.findOne({
        _id: req.body.eventId
        //status: 'created'
    })
        .exec(function(err, event) {
            if(err) return next(err);
            if(!event) return next();

            // console.log(req.body.picture);

            for (var i = 0; i < req.body.picture.length; i++) {
                event.gallery.push({
                    picture: req.body.picture[i],
                    user: req.user._id
                });
            }

            event.save(function(err, e) {
                if(err) return next(err);

                notification.sendNotification(
                    req.user,
                    e.invited.map(function(u) {if(u.status == 1 && u.user+'' != ''+req.user._id) return u.user}),
                    req.user.firstName + " uploaded a photo on " + event.title,
                    {type: 'ADD_PICTURE', data: e._id}
                );

                var logData = {
                    user: req.user._id,
                    action: 'PHOTO_UP',
                    state: 'MOMENT_GALLERY'
                }

                Logs.saveLogFromUser(logData);

                return res.json({
                    data: 'OK'
                });
            });
        });
};

exports.searchEvents = function(req, res, next) {

    var q = {};
    if(req.query.search) {
        var s = utils.regExpEscape(req.query.search);
        q.$and = [
            {
                title: new RegExp('^'+ s, 'g')
            }
        ];
    }

    Event.find(q)
        .select()
        .sort('-startingDate')
        .populate('mood')
        .populate({ 
            path: 'invited.user',
            select: 'firstName lastName fbId mood picture',
            populate: {
                path: 'mood',
                model: 'Mood'
            }
        }) 
        .populate({ 
            path: 'author',
            select: 'firstName lastName fbId mood picture',
            populate: {
                path: 'mood',
                model: 'Mood'
            }
        })
        .lean()
        .exec(function(err, results) {
            if(err) return next(err);

            return res.json({
                data: results
            });
        });
};

exports.activityAround = function(req, res, next) {
    var data = [
        {
            id : 1,
            title : "TOP 5 PLACES TO EAT",
            detail : "TOP 5 BRUNCH FOR THE WEEKEND",
            image : "http://192.168.1.59/moodup-server/images/activity_around/discover_top_5_places.png"
        },
        {
            id : 2,
            title : "BEST PLACES TO HANG OUT",
            detail : "TOP 5 FREE FOR THE WEEKEND",
            image : "http://192.168.1.59/moodup-server/images/activity_around/discover_best_places_to_hangout.png"
        },
        {
            id : 3,
            title : "TOP 5 PLACES TO EAT",
            detail : "TOP 5 BRUNCH FOR THE WEEKEND",
            image : "http://192.168.1.59/moodup-server/images/activity_around/discover_top_5_places.png"
        },
        {
            id : 4,
            title : "BEST PLACES TO HANG OUT",
            detail : "TOP 5 FREE FOR THE WEEKEND",
            image : "http://192.168.1.59/moodup-server/images/activity_around/discover_best_places_to_hangout.png"
        },
        {
            id : 5,
            title : "TOP 5 PLACES TO EAT",
            detail : "TOP 5 BRUNCH FOR THE WEEKEND",
            image : "http://192.168.1.59/moodup-server/images/activity_around/discover_top_5_places.png"
        },
        {
            id : 6,
            title : "BEST PLACES TO HANG OUT",
            detail : "TOP 5 FREE FOR THE WEEKEND",
            image : "http://192.168.1.59/moodup-server/images/activity_around/discover_best_places_to_hangout.png"
        }
    ];
    return res.json({
        status : 1,
        data: data
    });
}

exports.createActivity = function(req, res, next) {
    req.checkBody('title');
    req.checkBody('mood');
    req.checkBody('startingDate');
    req.checkBody('endingDate');
    req.checkBody('location');
    req.checkBody('invited');
    req.checkBody('invited_groups');
    req.checkBody('invited_contacts');

    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));
    var activity = req.body;
    activity.author = req.user._id;
    /*activity.invited = activity.invited.map(function(x){
        return {user : x.toString() , status : 0}
    })*/
    var friends = [];
    async.waterfall([
        function(callback){
            if(activity.invited_groups.length > 0){
                Group.find({_id : { $in : activity.invited_groups}})
                    .select('members')
                    .exec(function(err, groups) {
                        if (err) return next(err);

                        var grp_data = [];
                        groups.forEach(function (x) {
                            var mem = x.members.map(function (y) {
                                return {user: y.toString(), status: 0}
                            })
                            grp_data.push({id: (x._id).toString(), users: mem})
                        })
                        activity.invited_groups = grp_data;
                        callback();
                    })
            }else {
                callback();
            }
        },
        function(callback){
            if(activity.invited_contacts.length > 0){

                var contactNumbers = _.pluck(activity.invited_contacts, "number");
                var regex = _.map(contactNumbers, function(k){ return new RegExp(".*" + k + ".*", 'i'); });
                User.find({
                    _id: { $ne: req.user._id },
                    'contactNumber': { '$in': regex }
                })
                    .exec(function(err, contactFriend) {
                        var contactNo = _.uniq(_.pluck(contactFriend, "contactNumber"));
                        friends = _.pluck(contactFriend, "_id");
                        activity.invited = _.uniq(_.union(friends , activity.invited));
                        var diff = _.difference(contactNumbers, contactNo);

                        async.eachSeries(diff, function iterator(x, callback1) {
                            if(name == null){
                                var name = _.find(activity.invited_contacts, function(usr){ return usr.number == x; }).name;
                            }else{
                                var name = "";
                            }
                            user = new User();
                            user.fbId = "";
                            user.contactNumber = x;
                            user.firstName = name;
                            user.lastName = "";
                            user.gender = "male";
                            user.username = "";
                            user.is_moodup_user = 0;
                            user.email = "";
                            user.fbFriends = [];
                            user.picture = {imgId: "",imgUrl: ""};

                            user.save(function(err, u) {
                                if(err) callback();
                                (activity.invited).push(u._id);
                                callback1();
                            })
                        },function(done){
                            activity.invited = _.map(activity.invited, function(k){ return k.toString(); });
                            callback();
                        })
                    })
            }else{
                callback();
            }
        }
    ], function (err, result) {
        activity.invited = activity.invited.map(function(x){
            return {user : x.toString() , status : 0}
        })
        activity.createdAt = new Date().getTime();
        var group_arr = _.uniq(_.pluck(_.flatten(_.pluck(activity.invited_groups , "users")) , "user"));
        var user_arr = _.uniq(_.pluck(activity.invited , "user"));
        var users = _.union(group_arr , user_arr);

        Activity(activity).save(function(err, e) {
            if(err) return next(err);
            User.find({_id : {$in: users.map(function(o){ return mongoose.Types.ObjectId(o); })}}, function(err, usrs) {
                notification.sendNotification(
                    req.user,
                    usrs,
                    "You have been invited to the " + activity.title + " event!",
                    {type: 'NEW_EVENT', data: e._id}
                );
            })

            return res.json({
                status : 1,
                message: 'EVENT_CREATED',
                data : {
                    _id : e._id,
                    name : activity.title,
                    users : users
                }
            });
        });

    });
};

exports.getActivities = function(req, res, next) {

    Activity.find({$or:[
        {author: req.user._id},
        {invited: {$elemMatch: {'user': req.user._id , status: 1}}},
        {invited_groups: {$elemMatch: {'users': {$elemMatch: {'user': req.user._id,status: 1}}}}}
    ]})
      .select('title mood createdAt author invited invited_groups')
        .populate({
            path: 'invited.user',
            select: 'username fbId picture'
        })
        .populate({
            path: 'invited_groups.users.user',
            select: 'username fbId picture'
        })
      .populate({ 
        path: 'mood',
        select: 'name'
       })
        .populate({
            path: 'author',
            select: 'username fbId picture'
        })
      .sort('-createdAt')
      .exec(function(err, activities) {
            if(err) return next(err);

            var all_activity = [];

            _.each(activities , function(u){

                var users = [];
                _.each(u.invited , function(user){
                    //console.log("users >>>> " + JSON.stringify(user));
                    users.push({_id : user.user._id,username:user.user.username,pic:user.user.picture.imgUrl,fbId : user.user.fbId,status : user.status});
                })

                var group_users = _.flatten(_.pluck(u.invited_groups , 'users'));
                _.each(group_users, function(user){
                    users.push({_id : user.user._id,username:user.user.username,pic:user.user.picture.imgUrl,fbId : user.user.fbId,status : user.status});
                })

                //var all_users = _.uniq(_.union(users, group_users), false, function(u, key, a){ return u._id; });
                var all_users = _.uniq(users, false, function(u, key, a){ return u._id; });

                if((u.author._id).toString() != (req.user._id).toString()){
                    all_users.push({_id : u.author._id,username:u.author.username,pic:u.author.picture.imgUrl,fbId : u.author.fbId,status : 1});
                    all_users = _.filter(all_users, function(user) {
                        return (user._id).toString() !== (req.user._id).toString()
                    });
                }

                var chat_users = [];
                _.each(all_users , function(usr){
                    chat_users.push({_id : usr._id,username : usr.username, pic:usr.pic,status:usr.status});
                })
                all_activity.push({activity_id : u._id,username : u.author.username,mood : "Let's "+u.mood.name,pic: u.author.picture.imgUrl,members : 0,createdAt : u.createdAt,users : chat_users});
            })

            return res.json({
                status : 1,
                message: 'All Activities',
                data : all_activity
            });
        })
        
}

exports.getNewActivities = function(req, res, next) {
    Notification
        .find({
            to: req.user._id,
            seen: false,
            type: "NEW_EVENT"
        })
        .select('type event text createdAt from to')
        .populate({
            path: 'from',
            select: 'fbId firstName lastName picture'
        })
        .populate({
            path: 'to',
            select: 'username'
        })
        .populate({
            path: 'event',
            select: 'title mood',
            populate: {
                path: 'mood',
                model: 'Mood',
                select : 'name color'
            }
        })
        .sort('createdAt')
        .exec(function (err, notifs) {
            if (err) return next(err);

            var activities = [];
            _.each(notifs , function(noti){
                var activity = {
                    id: noti.event._id,
                    firstName: noti.from.firstName,
                    lastName: noti.from.lastName,
                    pic: noti.from.picture.imgUrl,
                    noti_id: noti._id,
                    eventName: noti.event.title,
                    mood: noti.event.mood.name,
                    user_id : req.user._id,
                    to : noti.to,
                    color: noti.event.mood.color
                };

                activities.push(activity);
            })

            return res.json({
                status: 1,
                data: activities
            });

        })
}

exports.createCustomEvent = function(req, res, next) {
    // req.checkBody('title').notEmpty();
    // req.checkBody('description').notEmpty();
    // req.checkBody('startingDate').notEmpty();
    // req.checkBody('endingDate').notEmpty();
    // req.checkBody('location').notEmpty();

    if (!req.body || !req.body.key || req.body.key != "M3p962yM58cn;4<DZP0HBRqtwE[0gA") return next(new Error('Invalid request'));

    var customEvent = {};
    customEvent.title = req.body.title;
    customEvent.description = req.body.description;
    customEvent.startingDate = req.body.startingDate;
    customEvent.endingDate = req.body.endingDate;
    customEvent.location = req.body.location;
    customEvent.mood = req.body.mood;
    customEvent.author = req.body.author;
    customEvent._id = req.body._id;
    customEvent.picture = req.body.picture;

    var testList = [
        "56ddd3ad5a0dd70300f6bda4", // kevin moodup
        "567b288737fa3b030066d28a", // kevin real
        "567b278137fa3b030066d288", // riaz real
        "56db2d6e293c280300d91c75", // riaz moodup
        // "56869df6bd685c0300450abe", // ada real
        "5696b4d91a46110300c40c75", // boris real
        // "56a7f4437897e70300e364ee", // Es'Thime
        // "568fd107ea62d85f4ee8bd26", // choco
        // "57162ed453c9931942a5e083" // Gael
    ]

    var q = {
        $and: [
            { _id: { $ne: '570f8f89ccf20b3d2296196a' }}//,
            // { _id: { $in: testList } }
        ],
        status: 'validated'
    };

    var maxD = 50;
    if (customEvent._id != '571618392b94ec03005268a9') maxD = 30;

    q['location.geo'] = {
        $near: customEvent.location.geo,
        $maxDistance : maxD / 111.12 // conversion from km
    };

    var author = {
        _id: "570f8f89ccf20b3d2296196a",
        firstName: "MoodUP",
        lastName: ""
    }

    User
        .find(q)
        .lean()
        .exec(function(err, users) {
            if(err) return next(err);
            customEvent.invited = users.map(function(u) {
                return {user:u, status: false}
            });

            // console.log(customEvent);

            Event(customEvent).save(function(err, e) {
                if(err) return next(err);

                notification.sendNotification(
                    author,
                    e.invited.map(function(u) {return u.user}),
                    "You have been invited to the " + customEvent.title + " event!",
                    {type: 'NEW_EVENT', data: e._id}
                );

                return res.json({
                    message: 'EVENT_CREATED',
                    data: e.toObject()
                });
            });

            // return res.json({
            //     data: users
            // });
        });

    }

    exports.addCustomEventInvited = function (user) {

        var authorId = '570f8f89ccf20b3d2296196a';
        var eventId = '571618392b94ec03005268a9';
        var eventIds = [
            '571618392b94ec03012378c9',
            '571618392b94ec03005268a9',
            '571618392b94ec04212378b9',
            '571618392b94ec04212378d0'
        ];
        var notifDest = [];
        notifDest.push(user);

        var author = {
            _id: "570f8f89ccf20b3d2296196a",
            firstName: "MoodUP",
            lastName: " "
        }

        // Event.findOne({_id: eventId})
        Event.find({_id: {$in: eventIds}})
            .exec(function(err, events) {
                if(err) return next(err);
                if(!events) return next();

                var invitedUser = {
                    user: user._id,
                    status: true
                }

                events.forEach(function (event) {

                    event.invited.push(invitedUser);

                    event.save(function(err) {
                        if(err) return next(err);

                        notification.sendNotification(
                            author,
                            notifDest,
                            "You have been invited to the " + event.title + " ",
                            {type: 'NEW_EVENT', data: event._id}
                        );

                        // return res.json({
                        //     data: 'OK'
                        // });
                    });
                })


            });
    }