var geocoder = require('geocoder');
var mongoose = require('mongoose');
var Mood = mongoose.model('Mood');
var User = mongoose.model('User');
var Learner=mongoose.model('LearnerModel');
var Project=mongoose.model('ProjectModel');
var utils = require('../../lib/utils');
var notification = require('../../lib/notification');
var Logs = require('../../lib/logs');
var request = require('request');
var async = require('async');
var _ = require('underscore');
var geolib = require('geolib');
var path = require('path');
var emailUtil = require('../../lib/email');
// Expose
/*
 * Get users depending on filters:
 * People: All, Friends, Uppers
 * Moods: Specified
 */
//new app code //


function rand(digits) {
    return Math.floor(Math.random()*parseInt('8' + '9'.repeat(digits-1))+parseInt('1' + '0'.repeat(digits-1)));
}


exports.play_count= function(req, res, next) {
 
     req.checkBody('video_id').notEmpty();
     video_id=req.body.video_id;

     if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));
     
     


      Project.findOne({ _id:video_id}, function (err, video) {     
      if (err) return next(err);

      if(video)
         { 

           
           video.play_count=video.play_count+1;
           video.save(function(err, u) {
        if(err) return next(err);

        return res.json({
            status : 1,
          
        })
    })


         }
         }); 


}



/**********************Add new learner*****************/
exports.learner= function(req, res, next) {
  // return res.render(path.resolve('views/index'));
     created_user= req.user._id;
     req.checkBody('learner_name').notEmpty();
     req.checkBody('learner_age').notEmpty();
     pic=req.body.learner_pic;

     if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

     learner = new Learner();
     learner.learner_id=rand(5);
     learner.created_user=created_user;
     learner.learner_name=req.body.learner_name;
     learner.learner_age=req.body.learner_age;
     if(pic!="")
     {
       learner.learner_pic=pic;
     }else
     {
       learner.learner_pic="";  
     } 

     learner.save(function(err, u) {
        if(err) return next(err);

        return res.json({
            status : 1,
            message : "Learner added successfully."
        })
    })
      
}




/*********************End************************/




/*******************Create new project***************/

exports.new_project= function(req, res, next) {

  console.log("new project");
  
  created_user= req.user._id;
  req.checkBody('learner_object_id').notEmpty();
  req.checkBody('learner_unique_id').notEmpty();
  req.checkBody('media_url').notEmpty();
   
   if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR')); 
    
    project=new Project();
    project.created_user=created_user;
    project.learner_object_id=req.body.learner_object_id;
    project.learner_unique_id=req.body.learner_unique_id;
    project.learner_name=req.body.learner_name;
    project.media_url=req.body.media_url;
    project.title=req.body.title;
    project.thumb_url=req.body.thumb_url;
    
     project.save(function(err, u) {
        if(err) return next(err);

        return res.json({
            status : 1,
            message : "Project added successfully."
        })
    })
}


/*******************end************************/


/***********************get user project lists**************/

exports.projects= function(req, res, next) {

    Learner.find({ created_user: req.user._id }, function (err, learners) {     
      if (err) return next(err);

      if(learners)
         {  
               learner = JSON.parse(JSON.stringify(learners));
               async.forEachOf(learner, function (value, i, callback) {
               Project.find({learner_object_id:learner[i]._id})
                    .select('media_url')
                    .exec(function(err, project) {
                        if (err) return next(err);
                        if(project.length>0)
                        {  
                            learner[i].pro=project;
                                    callback();
                                
                        }else{
                            learner[i].pro=project;
                            callback();
                        }
                    })
            },function(err){
                return res.json({
                    status : 1,
                    data : learner,
                })
            })
            }
   });
}


/*************************End**********************/


/***********************get user project lists**************/

exports.recentProjects= function(req, res, next) {

      var limit=10; 
      Project.find({created_user: req.user._id})
      .sort({createdAt:-1})
      .limit(limit)
      .exec(function(err, projects) {
    
       if (err) return next(err);

            return res.json({
                status : 1,
                data : projects
        })

   });

}


/*************************End**********************/

/**********************get learner list*************/

exports.getLearnerList=function(req,res,next)
{     

     var limit=10;  
     var offset= (req.body.page_no - 1) * limit;

     var is_search=req.body.is_search;
     var search_text=req.body.search_text;
      
    if(is_search==1)
    {
        var q={created_user: req.user._id,learner_name:{'$regex': search_text}};
    }else
    {
        var q={created_user: req.user._id};
    }  


     Learner.find(q)
    .sort({createdAt:-1})
    .skip(offset).limit(limit)
     .exec(function(err, learners) {
    
       if (err) return next(err);

            return res.json({
                status : 1,
                data : learners
        })

   });


}


/************************End**********************/

/*********************Update profile****************/


exports.updateProfile= function(req, res, next) {

    User.findOne({ _id : req.user._id }).exec(function(err, user) {
        if (err) return next(err);

    req.checkBody('pic').notEmpty();
    req.checkBody('zipcode').notEmpty();
      
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

       // user.username = req.body.username;
        //user.email = req.body.email;
        //user.password = req.body.password;
        user.zipcode=req.body.zipcode;
        user.pic=req.body.pic;
        user.save(function(err, user) {
            if(err) return next(err);

            return res.json({
                status : 1,
                message : "User profile updated successfully.",
                data : { _id : user._id, username : user.username,email : user.email,zipcode : user.zipcode,user_id:user.user_id,user_pic:user.pic}
            })
        })
    })
};

/***************End**************************/


/***************************User profile****************/

exports.userProfile=function(req, res, next)
{ 

      var userType=req.body.userType;
      var userId=req.body.userId;
      var modelType; 
      var selectAttr; 
      if(userType==1)
      {
          modelType=User;
         selectAttr= 'pic zipcode email username user_id'; 
      }else
      {

          modelType=Learner;
          selectAttr='learner_pic learner_age learner_name learner_id'; 

      }

        modelType.findOne({ _id : userId })
        .select(selectAttr)
         .exec(function(err, user) {
            if (err) return next(err);

            return res.json({
                status : 1,
                message : "User profile.",
                data : user
        })
    })


}



/***************************End***********************/

/*********************Edit learner*****************/

exports.edit_learner= function(req, res, next) {

      Learner.findOne({ _id : req.body.learner_id }).exec(function(err, learner) {
        if (err) return next(err);

    req.checkBody('learner_pic').notEmpty();
    req.checkBody('learner_age').notEmpty();
    req.checkBody('learner_name').notEmpty();
      
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

        learner.learner_pic = req.body.learner_pic;
        learner.learner_age = req.body.learner_age;
        learner.learner_name = req.body.learner_name;
      
        learner.save(function(err, learner) {
            if(err) return next(err);

            return res.json({
                status : 1,
                message : "Learner profile updated successfully.",
                data : {learner_pic:learner.learner_pic,learner_age:learner.learner_age,learner_name:learner.learner_name}
            })
        })
    })

}

/******************End**************************/


/*******************update password***********************/
exports.updatePassword = function(req, res, next){
    req.checkBody('email').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));
     
     var email=req.body.email;
     User.findOne({email: email}, function(err, user){ 
       if (err) return next(err);

        if(user){

                require('crypto').randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {

                    var mailOptions = {
                        to: user.email,
                        subject: 'Change password',
                        text:'Hi '+user.username.toUpperCase()+',\n\n'+ 
                        'You are receiving this email because you requested to change your password for Spectrum Reflect. If you did not make this request, please ignore the email.\n\n' +
                        'Please follow the link to change your password.'+'\n\n'+
                        'http://' + req.headers.host + '/api/update/' + token + '\n\n'
                    };

                    emailUtil.sendEmail(mailOptions);

                    return res.json({
                        status : 1,
                        message : "Instructions to change the password have been sent to your email."
                    })
                });
            });
        }else{
            return res.json({
                status : -1,
                message : "Email is not registered."
            })
        }
    })
}



/***********************end*******************************/





/***************************User profile****************/

exports.userProfile1=function(req, res, next)
{
        User.findOne({ _id : req.user._id })
         .exec(function(err, user) {
            if (err) return next(err);

            return res.json({
                status : 1,
                message : "User profile.",
                data : user
        })
    })


}



/***************************End***********************/




exports.index= function(req, res, next) {
   return res.render(path.resolve('views/index'));
}

exports.updateProfile1= function(req, res, next) {

    User.findOne({ _id : req.user._id }).exec(function(err, user) {
        if (err) return next(err);

        user.username = req.body.username;
        user.fullname = req.body.fullname;
        user.pic = req.body.pic;
        user.day=req.body.day;
        user.month=req.body.month;
        user.year=req.body.year;

        user.save(function(err, user) {
            if(err) return next(err);

            return res.json({
                status : 1,
                message : "User profile updated successfully.",
                data : {_id : user._id, fullname : user.fullname, email : user.email, pic : user.pic, day : user.day, month : user.month, year : user.year, rewards : user.rewards, username : user.username }
            })
        })
    })
};

exports.getProfile= function(req, res, next) {
    User.findOne({ _id : req.user._id })
         //.select('fullname email pic day month year username')
         .exec(function(err, user) {
            if (err) return next(err);

            return res.json({
                status : 1,
                message : "User profile.",
                data : user
        })
    })
};

exports.getMooders = function(req, res, next) {
    var moodList = [];

    // if we receive a list of moods in the filters
    if (req.query.moodList) {
        if(typeof req.query.moodList == 'object') {
            // got many moods
            req.query.moodList.forEach(function(mood) {
                moodList.push(mood);
            })
        } else {
            // got 1 mood
            moodList.push(req.query.moodList);
        }
    }

    var q = {
        $and: [
            { _id: { $ne: req.user._id }}

        ],
        status: 'validated'
    };

    if(req.query.friendsOnly != 'true') q.privacy = 1;

    if(req.query.available == 'today') q.available = 'today';
    else if (req.query.available == 'later') q.available = 'later';

    // old home support which used moodId
    if (req.query.moodId) q.mood = req.query.moodId;
    else q.$and.push({ mood: { $in: moodList}});

    if (!req.query.getAll || req.query.getAll =='false') {
        q.$and.push({ _id: req.query.friendsOnly == 'true' ? {$in : req.user.friends} : {$nin : req.user.friends}});
        // q.$and.push({ _id: req.query.friendsOnly == 'true' ? {$nin : req.user.friendRequest} : {$in : req.user.friendRequest}});
    }

    if(req.query.maxDistance != 55 && req.user.location.geo) { // 55 = max distance in front (TODO)
        q['location.geo'] = {
            $near: req.user.location.geo,
            $maxDistance : req.query.maxDistance / 111.12 // conversion from km
        };
    }


    // if(req.query.search) {
    //     var s = utils.regExpEscape(req.query.search);
    //     q.$or = [
    //         {
    //             firstName: new RegExp('^'+ s, 'i')}, {
    //             lastName: new RegExp('^'+ s, 'i')
    //         }
    //     ];
    // }

    var limit = req.query.limit ? req.query.limit : 30; // max users

    User
        .find(q)
        .select('firstName lastName fbId picture mood picture friendRequest') //remove friendRequest when old app is gone
        .populate('mood')
        .populate({ //remove friendRequest when old app is gone
            path: 'friendRequest',
            populate: {
                path: 'mood',
                model: 'Mood'
            },
            select: '_id'
        })
        .limit(limit)
        .skip(req.query.from)
        .exec(function(err, users) {
            if(err) return next(err);

            return res.json({
                data: users
            });
        });
};

exports.getAllUppers = function(req, res, next) {
    //
    var q = {
        $and: [
            { _id: { $ne: req.user._id }}
        ],
        status: 'validated'
    };

    if (!req.query.getAll || req.query.getAll =='false') q.$and.push({ _id: req.query.friendsOnly == 'true' ? {$in : req.user.friends} : {$nin : req.user.friends}});

    if(req.query.friendsOnly != 'true') q.privacy = 1;

    if(req.query.available == 'today') q.available = 'today';
    else if (req.query.available == 'later') q.available = 'later';

    if(req.query.maxDistance != 55 && req.user.location.geo) { // 55 = max distance in front (TODO)
        q['location.geo'] = {
            $near: req.user.location.geo,
            $maxDistance : req.query.maxDistance / 111.12 // conversion from km
        };
    }

    // if(req.query.search) {
    //     var s = utils.regExpEscape(req.query.search);
    //     q.$or = [
    //         {
    //             firstName: new RegExp('^'+ s, 'i')}, {
    //             lastName: new RegExp('^'+ s, 'i')
    //         }
    //     ];
    // }

    var limit = req.query.limit ? req.query.limit : 30; // max users

    if(req.query.getAll == 'false') {
        // if not getting all users
        User
            .find(q)
            .select('firstName lastName fbId mood picture')
            .populate('mood')
            .limit(limit)
            .skip(req.query.from)
            .sort({'lastAction': -1})
            .lean()
            .exec(function(err, users) {
                if(err) return next(err);

                return res.json({
                    data: users
                });
            });
    } else {

        // populate list with friends first, then everyone else
        // step 1: create a list of users that we'll send back
        // step 2: query the db for the current user's friends that we'll add first into the user list
        // step 3: if the length of the list equals the limit, stop here else go to step 4
        // step 3.5: if the length of the list is below the limit, continue populating the list with uppers
        // step 4: if there aren't enough friends, add uppers

        // step 1: create a list of users that we'll send back
        // a result object that will contain skipping information and the list
        var result = {
            allUppersList: [],
            friendCount: +req.query.friendCount
        };

        var qq = {
            friends: req.user._id,
            status: 'validated'
        };

        if(req.query.available == 'today') qq.available = 'today';
        else if (req.query.available == 'later') qq.available = 'later';

        // step 2: query the db for the current user's friends that we'll add first into the user list
        User.find(qq)
            .select('firstName lastName fbId mood picture') //add friends later on for affinity linking
            .populate('mood')
            .limit(limit)
            .skip(req.query.from)
            .sort({'lastAction': -1})
            .lean()
            .exec(function(err, friends) {
                if(err) return next(err);

                //friends.forEach((friend) => result.allUppersList.push(friend) )
                friends.forEach(function(friend) { result.allUppersList.push(friend) },this);

                if (result.friendCount != friends.length) result.friendCount += friends.length;

                // step 3: if the length of the list equals the limit, stop here else go to step 4
                if (friends.length >= limit) {
                    return res.json({
                        data: result
                    });
                    // step 4: if there aren't enough friends, add uppers
                } else {
                    q.$and.push({ _id: {$nin : req.user.friends}});
                    // var from = req.query.from - req.query.friendsCount

                    // recalculate the limit and skip
                    limit = limit - friends.length; // intact if no friends
                    var skipCount = req.query.from - result.friendCount > 0 ? req.query.from - result.friendCount : 0;
                    // 0 if still adding friends, the proper amount if no more friends

                    User.find(q)
                        .select('firstName lastName fbId mood picture')
                        .populate('mood')
                        .limit(limit)
                        .skip(skipCount)
                        .sort({'lastAction': -1})
                        .lean()
                        .exec(function(err, users) {
                            if(err) return next(err);

                            //users.forEach((user) => result.allUppersList.push(user) )
                            users.forEach(function(user) { result.allUppersList.push(user) },this);

                            return res.json({
                                data: result
                            });
                        });
                }
            })
    }
}

exports.getTutorialUppers = function(req, res, next) {
    var tutorialUsers = [
        // "56ddd3ad5a0dd70300f6bda4", // kevin moodup
        "567b288737fa3b030066d28a", // kevin real
        "567b278137fa3b030066d288", // riaz real
        // "56db2d6e293c280300d91c75", // riaz moodup
        "56869df6bd685c0300450abe", // ada real
        "5696b4d91a46110300c40c75", // boris real
        "56a7f4437897e70300e364ee", // Es'Thime
        // "568fd107ea62d85f4ee8bd26", // choco
        "5710bbddf18fe74d4dbc9389" // Gael
    ]

    var q = {
        $and: [
            { _id: { $in: tutorialUsers } }
        ],
        status: 'validated'
    };

    User
        .find(q)
        .lean()
        .exec(function(err, users) {
            if(err) return next(err);

            return res.json({
                data: users
            });
        });
}
 
exports.getFriends = function(req, res, next) {
    User.findOne({_id: req.user._id})
        .populate({
            path: 'friends',
            select: 'firstName lastName location fbId contactNumber picture'
        })
        .populate({
            path: 'groups',
            select: 'name createdAt',
            options: { sort: { createdAt: -1 }}
        })
        .lean()
        .exec(function(err, friends) {
            if(err) return next(err);
            if((friends.friends).length > 0 || (friends.groups).length > 0){
                var fnd = [];
                var nr_fnd = [];
                
                friends.friends = _.uniq(friends.friends, function(x){return x._id;});
                _.each(friends.friends, function(friend){

                    var flag = geolib.isPointInCircle(
                        {latitude: req.user.location.geo.coordinates[1], longitude: req.user.location.geo.coordinates[0]},
                        {latitude: friend.location.geo.coordinates[1], longitude: friend.location.geo.coordinates[0]},
                        5000
                    );
                    if(flag){
                        var data = {id : friend._id,fbId : friend.fbId,firstName : friend.firstName,lastName : friend.lastName,pic : friend.picture.imgUrl,contactNumber : friend.contactNumber};
                        nr_fnd.push(data);
                    }else{
                        var data = {id : friend._id,fbId : friend.fbId,firstName : friend.firstName,lastName : friend.lastName,pic : friend.picture.imgUrl,contactNumber : friend.contactNumber};
                        fnd.push(data);
                    }
                })

                var data = {near_by_friends : nr_fnd,friends : fnd , groups : friends.groups}

                return res.json({
                    status: 1,
                    message : "contact list",
                    data: data
                });
            }else{
                var data = {near_by_friends : [],friends : [] , groups : []}

                return res.json({
                    status: 1,
                    message : "contact list",
                    data: data
                });
            }
        });
}

exports.getAllFriends = function(req, res, next) {
    User.findOne({_id: req.user._id})
        .populate({
            path: 'friends',
            select: 'firstName lastName fbId contactNumber picture'
        })
        .lean()
        .exec(function(err, friends) {
            if(err) return next(err);
            var fbfriend = [];
            _.each(friends.friends , function(u){
                /*if(u.fbId != ""){
                    var pic = "http://graph.facebook.com/"+ u.fbId+"/picture?type=large";
                    var friend = {_id : u._id,firstName : u.firstName,lastName : u.lastName,pic : pic,contactNumber: u.contactNumber};
                }else{
                    var friend = {_id : u._id,firstName : u.firstName,lastName : u.lastName,pic : "",contactNumber: u.contactNumber};
                }*/
                var friend = {_id : u._id,firstName : u.firstName,lastName : u.lastName,pic : u.picture.imgUrl,contactNumber: u.contactNumber};
                fbfriend.push(friend);
            })
            return res.json({
                status: 1,
                message : "all friends",
                data: fbfriend
            });
        });
}

exports.unFriend = function(req, res, next) {
    req.checkBody('userId').notEmpty();

    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));
    User.findById(req.body.userId, function(err, friend) {
        if (err) return next(err);

        if (!friend) return next(new Error('User not found'));

        // remove from friend's friends
        var idx = friend.friends.indexOf(req.user._id);
        if(idx > -1) {
            friend.friends.splice(idx, 1);
        }

        // remove from user's friends
        idx = req.user.friends.indexOf(friend._id);
        if(idx > -1) {
            req.user.friends.splice(idx, 1);
        }

        friend.save(function(err) {
            if(err) return next(err);

            req.user.save(function(err) {
                if(err) return next(err);

                return res.json({
                    status : 1,
                    message: 'UNFRIEND'
                });
            });

        });

    })
}

exports.getFBFriends = function(req, res, next) {

    //var fields = ['id','email','name','first_name','last_name','gender','birthday'];
    //var graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + fields.join(',');
    //var permissionUrl = 'https://graph.facebook.com/v2.5/me/permissions';
    var friendsUrl = 'https://graph.facebook.com/me/friends';
    var mFriends = [];
    var fbFriends = [];

    async.waterfall([
        function (callback) {
            if(req.body.accessToken != ""){
                getFbFriends(callback);
            }else{
                callback();
            }
        },
        function (callback) {
            if((req.body.deviceContact).length > 0){
                var deviceContact = _.map(req.body.deviceContact, function(num){ return new RegExp(num, "i"); });
                getMoodUpContact(deviceContact,callback);
            }else{
                callback();
            }
        }
    ], function(done){
        var allfnd = _.union(fbFriends, mFriends);
        var allFriends = _.uniq(allfnd, function(x){ return x.id; });
        allFriends = _.sortBy(allFriends, function (user) {return user.firstName});

        return res.json({
            status : 1,
            message: "MoodUp users",
            data: allFriends
        });
    })

    function getMoodUpContact(contacts,callback){
        User.find({_id : {$nin : req.user._id},contactNumber: {$in: contacts},is_moodup_user: 1})
            .select({ firstName: 1,lastName: 1,fbId : 1,friends : 1,friendRequest : 1,picture : 1,contactNumber : 1})
            .exec(function(err, mfriend) {
                _.each(mfriend,function(u){

                    if((u.friends).indexOf(req.user._id) != -1){
                        return true;
                    }
                    else if((u.friendRequest).indexOf(req.user._id) != -1) {
                        return true;
                    }
                    else if((req.user.friends).indexOf(u._id) != -1) {
                        return true;
                    }
                    else if((req.user.friendRequest).indexOf(u._id) != -1) {
                        return true;
                    }else{
                        if(u.fbId != ""){
                            //var pic = "http://graph.facebook.com/"+ u.fbId+"/picture?type=large";
                            var friend = {id : u._id,fbId : u.fbId,firstName : u.firstName,lastName : u.lastName,pic : u.picture.imgUrl,type : 3,contactNumber: u.contactNumber};
                        }else{
                            var friend = {id : u._id,fbId : "",firstName : u.firstName,lastName : u.lastName,pic : u.picture.imgUrl,type : 2,contactNumber: u.contactNumber};
                        }
                        mFriends.push(friend);
                        return true;
                    }
                })
                callback();
            })
    }

    function getFriends(callback){
        User.findOne({_id: req.user._id})
            .populate('fbFriends')
            .exec(function(err, userfriends) {
                if(err) return next(err);

                var fbFriends = [];
                _.some(userfriends.fbFriends, function(fbfriend) {
                    if((fbfriend.friends).indexOf(req.user._id) != -1){
                        return true;
                    }
                    else if((fbfriend.friendRequest).indexOf(req.user._id) != -1) {
                        return true;
                    }
                    else if((req.user.friends).indexOf(fbfriend._id) != -1) {
                        return true;
                    }
                    else if((req.user.friendRequest).indexOf(fbfriend._id) != -1) {
                        return true;
                    }
                    else{
//                        var pic = "http://graph.facebook.com/"+fbfriend.fbId+"/picture?type=large";
                        var friend = {id : fbfriend._id,fbId : fbfriend.fbId,firstName : fbfriend.firstName,lastName : fbfriend.lastName,pic : fbfriend.picture.imgUrl,type : 1,contactNumber: fbfriend.contactNumber}
                        fbFriends.push(friend);
                        return true;
                    }
                })

                callback();
            });
    }

    function getFbFriends(callback){
        var accessToken = {access_token: req.body.accessToken};

        // Get friends from fb
        request.get({ url: friendsUrl, qs: accessToken, json: true }, function(err, response, friends) {
            if (err) return next(new Error('FB_FRIENDS_CHECK_ERROR'));

            var friendsIds = friends.data.map(function (f) {
                return f.id;
            });

            // Convert users from friends
            User.find({
                fbId: {$in: friendsIds}}).exec(function(err, userFBFriends) {

                req.user.fbFriends = userFBFriends;

                (req.user).save(function(err, u) {
                    if (err) return next(err);
                    getFriends(callback);
                })


            });

        });

    }
}

exports.getFBContact = function(req, res, next) {
    req.checkBody('url').notEmpty();
    req.checkBody('contactNumber').notEmpty();

    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    var fields = ['id','email','name','first_name','last_name','gender','birthday'];
    var graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + fields.join(',');

    var contactNumber = req.body.contactNumber;
    var url = req.body.url;
    var friendsUrl = url.split("?")[0];
    var accessToken = url.split("?")[1];
    accessToken = {access_token: accessToken.replace("access_token=", "")};

    // Get user data
    request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
        if (response.statusCode !== 200) return next(new Error('FB_GRAPH_ERROR'));

        // Get friends from fb
        request.get({ url: friendsUrl, qs: accessToken, json: true }, function(err, response, allFbFriends) {
            if (err) return next(new Error('FB_FRIENDS_CHECK_ERROR'));

            var friendsIds = allFbFriends.data.map(function (f) {
                return f.id;
            });

            // Convert users from friends
            User.find({
                fbId: {$in: friendsIds}
            })
                .select('_id')
                .exec(function(err, userFBFriends) {

                var all_users = _.union(req.user.fbFriends, _.pluck(userFBFriends, '_id'));
                req.user.fbFriends = _.uniq(_.map(all_users, function(val){ return val.toString(); }));
                req.user.fbId = profile.id;
                req.user.email = profile.email;
                req.user.picture.imgId = profile.id;
                req.user.picture.imgUrl = "http://graph.facebook.com/"+ profile.id +"/picture?type=large";
                (req.user).save(function(err, u) {
                    if (err) return next(err);

                    filterFriends();
                })

                function filterFriends(){
                    User.findOne({_id: req.user._id})
                        .populate('fbFriends')
                        .select('firstName lastName fbFriends picture is_moodup_friend contactNumber')
                        .exec(function(err, userFull) {
                            if(err) return next(err);
                            var fbFriends = [];

                            _.each(userFull.fbFriends , function(friend){
                                var friend = {id : friend._id,fbId : friend.fbId,firstName : friend.firstName,lastName : friend.lastName,pic : friend.picture.imgUrl,is_moodup_friend : friend.is_moodup_user,contactNumber : friend.contactNumber}
                                fbFriends.push(friend);
                            })
                            return res.json({
                                status : 1,
                                message: "FB friend list",
                                data: fbFriends,
                                next : allFbFriends.paging.next
                            });
                        });
                }
            });
            // Async Data : PushDevices, location

        });
    })
}

exports.getDeviceContact = function(req, res, next) {
    var contacts = req.body.contacts.split(",");
    contacts = _.map(contacts, function(num){ return new RegExp(num, "i"); });

    User.find({contactNumber: {$in: contacts},is_moodup_user: 1})
        .select({ firstName: 1,lastName: 1,contactNumber : 1})
        .exec(function(err, friends) {
            return res.json({
                status: 1,
                message : "device contact",
                data: friends
            });
        })
}

exports.search = function(req, res, next) {
    req.checkBody('search').notEmpty();
    req.checkBody('type').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    var type = req.body.type;
    var re = new RegExp(req.body.search, 'i');



    switch (type) {
        case 1: //type 1 is for friend search
            User.findOne({_id: req.user._id})
                .populate({
                    path: 'friends',
                    select: 'firstName lastName fbId contactNumber picture',
                    match : { $or : [{ 'firstName': { $regex: re }}, { 'lastName': { $regex: re }}]}
                })
                .exec(function(err, users) {
                    //var friends = users.friends;
                    var friends = [];
                    _.each(users.friends , function(u){
                        var friend = {_id : u._id,firstName : u.firstName,lastName : u.lastName,pic : u.picture.imgUrl,contactNumber: u.contactNumber};
                        friends.push(friend);
                    })
                    return res.json({
                        status: 1,
                        message : "friends",
                        data : friends
                    });
                });
            break;
        case 2: // type 2 is for group search
            User.findOne({_id: req.user._id})
                .populate({
                    path: 'groups',
                    select: 'name members',
                    match : { 'name': { $regex: re }},
                    populate: {
                        path: 'members',
                        select: 'firstName lastName contactNumber fbId is_moodup_user picture'
                    }
                })
                .exec(function(err, groups) {
                    //var groups = users.groups;
                    var grps = [];
                    _.each(groups.groups , function(group){
                        var members = [];
                        _.each(group.members , function(u){s
                            var user = {id : u._id,firstName : u.firstName,lastName : u.lastName,contactNumber : u.contactNumber,pic : u.picture.imgUrl,is_moodup_user : u.is_moodup_user};
                            members.push(user);
                        })
                        grps.push({_id : group._id,name : group.name,members : members});                
                    })
                    return res.json({
                        status: 1,
                        message : "groups",
                        data : grps
                    });
                });
            break;
        case 3: // type 3 is for fb friend search
            User.findOne({_id: req.user._id})
                .populate({
                    path: 'fbFriends',
                    select: 'firstName lastName',
                    match : { $or : [{ 'firstName': { $regex: re }}, { 'lastName': { $regex: re }}]}
                })
                .exec(function(err, users) {
                    var fbFriends = users.fbFriends;
                    return res.json({
                        status: 1,
                        message : "fb friends",
                        data : fbFriends
                    });
                });
        case 4: // type 4 is for username search
            User.find({
                $and: [
                    { _id: { $ne: req.user._id }},
                    { 'friends': { $ne : req.user._id } },
                    { 'friendRequest': { $ne: req.user._id } },
                    { _id: { $nin: req.user.friends} },
                    { _id: { $nin: req.user.friendRequest} },
                    {username: { $regex: re }}
                ]
            })
                .sort({ username: 1 })
                .select({ username: 1})
                .exec(function(err, users) {
                    return res.json({
                        status: 1,
                        message : "friends",
                        data : users
                    });
                });
            break;
        case 5: // type 5 is phone book friends
            User.findOne({_id: req.user._id})
                .populate({
                    path: 'friends',
                    select: 'firstName lastName',
                    match : { $or : [{ 'firstName': { $regex: re }}, { 'lastName': { $regex: re }}]}
                })
                .exec(function(err, users) {
                    var fbFriends = users.fbFriends;
                    return res.json({
                        status: 1,
                        message : "phone book friends",
                        data : fbFriends
                    });
                });
            break;
        case 6: // type 6  is for all mix search
            User.findOne({_id: req.user._id})
                .populate({
                    path: 'friends',
                    select: 'firstName lastName username fbId contactNumber picture',
                    match : { $or : [{ 'firstName': { $regex: re }}, { 'lastName': { $regex: re }},{ 'username': { $regex: re }}]}
                })
                .populate({
                    path: 'fbFriends',
                    select: 'firstName lastName username fbId contactNumber picture',
                    match : { $or : [{ 'firstName': { $regex: re }}, { 'lastName': { $regex: re }},{ 'username': { $regex: re }}]}
                })
                .exec(function(err, users) {
                    var Friends = _.uniq(_.union(users.friends, users.fbFriends), false, function(item, key, a){ return item.a; });

                    var allFriends = [];
                    _.each(Friends , function(u){
                        var friend = {_id : u._id,username : u.username,fbId : u.fbId,firstName : u.firstName,lastName : u.lastName,pic : u.picture.imgUrl,contactNumber : u.contactNumber};
                        allFriends.push(friend);
                    })
                    return res.json({
                        status: 1,
                        message : "Friends",
                        data : allFriends
                    });
                });
            break;
    }
}

exports.getFriendRequests = function(req, res, next) {

    //var limit = req.query.limit ? req.query.limit : 30; // max users

    User.find({ 'friendRequest': req.user._id, status: 'validated' })
        .select('firstName lastName fbId mood picture')
        .populate('mood')
        // .populate({
        //     path: 'friendRequest',
        //     populate: {
        //         path: 'mood',
        //         model: 'Mood'
        //      }
        //   })
        // .limit(limit)
        // .skip(req.query.from)
        .sort({'firstName': 1})
        .exec(function(err, users) {
            if(err) return next(err);

            return res.json({
                status : 1,
                data: users
            });
        });
}

exports.getSuggestions = function(req, res, next) {

    // stock the facebook ids of each fb friend that uses the app
    var fbIdList = [];
    var queryFbId = [];

    var fbData;
    if (req.body && req.body.data && req.body.data.data) fbData = req.body.data.data;
    else fbData = [];

    if(Array.isArray(fbData)){
        fbIdList = fbData.map(function(item) {
            // item = JSON.parse(item);
            return item.id;
        });
    } else {
        var queryFB = JSON.parse(fbData);
        fbIdList.push(queryFB.id);
    }

    // Get the user information from the fb ids
    var q = {
        $and: [
            { _id: { $ne: req.user._id }},
            // { _id: req.query.friendsOnly == 'true' ? {$in : req.user.friends} : {$nin : req.user.friends}},
            { 'friends': { $ne : req.user._id } },
            { 'friendRequest': { $ne: req.user._id } },
            { _id: { $nin: req.user.friends} },
            { _id: { $nin: req.user.friendRequest} },
            { fbId: { $in: fbIdList}}
        ],
        status: 'validated'
    };

    User.find(q)
        .select('_id firstName lastName mood fbId fbFriends friends picture')
        .populate('mood')
        .limit(15)
        .lean()
        .exec(function(err, friendsFromFB) {
            if(err) return next(err);

            var result = {
                fbFriends: friendsFromFB
            }

            // get user's friends
            User.find({
                _id: { $in: req.user.friends}
            })
                .select('_id firstName lastName mood fbId fbFriends friends picture')
                .populate('mood')
                .lean()
                .exec(function(err, userFriends) {
                    if(err) return next(err);

                    // make sure we don't add duplicates to the list of suggested users
                    var suggestedUsersList = [];
                    friendsFromFB.forEach(function(item) {
                        if (item.fbFriends && Array.isArray(item.fbFriends) && item.fbFriends.length > 0) {
                            item.fbFriends.forEach(function(fbSuggestedFriend) {
                                // make sure it isn't already in the list
                                if ( suggestedUsersList.indexOf(fbSuggestedFriend+'')==-1 ) suggestedUsersList.push(fbSuggestedFriend + '');
                            })
                        }
                        if (item.friends && Array.isArray(item.friends) && item.friends.length > 0) {
                            item.friends.forEach(function(suggestedFriend) {
                                // make sure it isn't already in the list
                                if (suggestedUsersList.indexOf(suggestedFriend+'')==-1) suggestedUsersList.push(suggestedFriend + '');
                            })
                        }
                    })
                    userFriends.forEach(function(item) {
                        if (item.fbFriends && Array.isArray(item.fbFriends) && item.fbFriends.length > 0) {
                            item.fbFriends.forEach(function(fbSuggestedFriend) {
                                // make sure it isn't already in the list
                                if ( suggestedUsersList.indexOf(fbSuggestedFriend+'')==-1 ) suggestedUsersList.push(fbSuggestedFriend + '');
                            })
                        }
                        if (item.friends && Array.isArray(item.friends) && item.friends.length > 0) {
                            item.friends.forEach(function(suggestedFriend) {
                                // make sure it isn't already in the list
                                if (suggestedUsersList.indexOf(suggestedFriend+'')==-1) suggestedUsersList.push(suggestedFriend + '');
                            })
                        }
                    })

                    // keep track of common friends in one list
                    var commonFriendsList = [];
                    commonFriendsList = commonFriendsList.concat(friendsFromFB);
                    // console.log("commonFriendsList", commonFriendsList.length);
                    commonFriendsList = commonFriendsList.concat(userFriends);
                    // console.log("commonFriendsList", commonFriendsList.length);

                    for (var i = suggestedUsersList.length - 1; i > 0; i--) {
                        var j = Math.floor(Math.random() * (i + 1));
                        var temp = suggestedUsersList[i];
                        suggestedUsersList[i] = suggestedUsersList[j];
                        suggestedUsersList[j] = temp;
                    }

                    // remove current user from the list
                    // console.log("suggestedUsersList", suggestedUsersList.length);
                    var index = suggestedUsersList.indexOf(req.user._id + '');
                    if (index !== -1) suggestedUsersList.splice(index, 1);
                    // console.log("suggestedUsersList", suggestedUsersList.length);

                    // time to get the user information
                    var qq = {
                        $and: [
                            { _id: { $in: suggestedUsersList }},
                            { _id: { $nin: req.user.friends} },
                            { _id: { $nin: req.user.friendRequest} }
                        ]
                    }
                    // nested query to find friends of friends
                    User.find(qq)
                        .select('_id firstName lastName mood fbId fbFriends friends picture')
                        .populate('mood')
                        // .limit(15)
                        .exec(function(err, suggestedUsers) {
                            if(err) return next(err);

                            var tempData = [];

                            suggestedUsers.forEach(function(sgu) {
                                if (fbIdList.indexOf(sgu.fbId+'')<0) {

                                    // create an object for each suggested user with their friends in common
                                    var o = {
                                        _id: sgu._id,
                                        firstName: sgu.firstName,
                                        lastName: sgu.lastName,
                                        mood: sgu.mood,
                                        fbId: sgu.fbId,
                                        commonFriends: [],
                                        commonCount: 0
                                    }

                                    // init a common list with the fb friends
                                    var commonIds = sgu.fbFriends;
                                    // check if they're also in the friends list of the user?
                                    sgu.friends.forEach(function(u) {
                                        if(commonIds.indexOf(u)==-1) commonIds.push(u);
                                    })

                                    // add common friend info
                                    commonIds.forEach(function(u) {
                                        commonFriendsList.forEach(function(obj) {
                                            if (u+'' === obj._id+'') {
                                                var commonFriend = {
                                                    _id: obj._id,
                                                    name: obj.firstName + ' ' + obj.lastName,
                                                    mood: obj.mood,
                                                    fbId: obj.fbId
                                                }
                                                o.commonFriends.push(commonFriend);
                                                o.commonCount++;
                                            }
                                        })
                                    })

                                    tempData.push(o);
                                }
                            })

                            tempData.sort(function(a, b){return b.commonCount - a.commonCount});
                            if (tempData.length > 30) tempData.length = 30;
                            result.sgFriends = tempData;

                            // send back the result with an fb friend list and suggested users list
                            return res.json({
                                data: result
                            })
                        })

                    // console.log("users", users);

                    // return res.json({
                    //     data: users
                    // });
                })

        });
}

exports.addFriend = function(req, res, next) {
    req.checkBody('userId').notEmpty();
    req.checkBody('notif_id').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    var userId = req.body.userId;

    // TODO Don't rely on front end info, get the user info from db and check from there
    if(req.user.friendRequest.indexOf(userId) > -1) {
        return res.json({
            status : 1,
            message: 'FRIEND_REQUEST_ALREADY_SENT'
        });
    }

    if(req.user.friends.indexOf(userId) > -1) {
        Notification.findByIdAndUpdate(req.body.notif_id, { $set: { seen: true }},function(err){
            if(err) return next(err);
        });
        return res.json({
            status : 1,
            message: 'ALREADY_FRIENDS'
        });
    }

    User.findOne({
        _id: userId,
        status: 'validated'
    }).exec(function(err, friend) {
        if(err) return next(err);
        if(!friend) return next(new Error('User not found'));

        var logData = {
            user: req.user._id,
            state: 'USER'
        }

        if(friend.friends.indexOf(req.user._id) > -1) {
            // DEJA FRIEND ? FIX
            req.user.friends.push(userId);
            req.user.save(function(err) {
                if(err) return next(err);

                notification.sendNotification(
                    req.user,
                    [friend],
                    req.user.firstName + " " + req.user.lastName + " is now your friend",
                    {type: 'FRIENDS', data: req.user._id}
                );

                Notification.findByIdAndUpdate(req.body.notif_id, { $set: { seen: true }},function(err){});

                notification.sendNotification(
                    friend,
                    [req.user._id],
                    friend.firstName + " " + friend.lastName + " is now your friend",
                    {type: 'FRIEND_REQUEST_ACCEPTED', data: req.user._id}
                );

                logData.action = 'ACC_REQ';
                Logs.saveLogFromUser(logData);

                return res.send({
                    status : 1,
                    message: 'FRIENDS'
                });
            });

        } else if(friend.friendRequest.indexOf(req.user._id) > -1) {
            var keyFriend = friend.friendRequest.indexOf(req.user._id);

            friend.friendRequest.splice(keyFriend, 1);
            friend.friends.push(req.user._id);

            req.user.friendRequest.splice(friend._id, 1);
            req.user.friends.push(friend._id);

            friend.save(function(err) {
                if(err) return next(err);

                req.user.save(function(err) {
                    if(err) return next(err);

                    notification.sendNotification(
                        req.user,
                        [friend],
                        req.user.firstName + " " + req.user.lastName + " is now your friend",
                        {type: 'FRIENDS', data: req.user._id}
                    );


                    Notification.findByIdAndUpdate(req.body.notif_id, { $set: { seen: true }}, function(err){});

                    notification.sendNotification(
                        friend,
                        [req.user._id],
                        friend.firstName + " " + friend.lastName + " is now your friend",
                        {type: 'FRIEND_SELF', data: req.user._id}
                    );


                    logData.action = 'ACC_REQ';
                    Logs.saveLogFromUser(logData);

                    return res.send({
                        status : 1,
                        message: 'FRIENDS'
                    });
                });
            });
            // TODO PUSH
        } else {
            req.user.friendRequest.push(userId);
            req.user.save(function(err) {
                if(err) return next(err);

                notification.sendNotification(
                    req.user,
                    [friend],
                    req.user.firstName + " " + req.user.lastName + " wants to be friends with you",
                    {type: 'FRIEND_REQUEST', data: req.user._id}
                );

                logData.action = 'SND_REQ';
                Logs.saveLogFromUser(logData);

                return res.send({
                    status : 1,
                    message: 'FRIEND_REQUEST_SENT'
                });

                // Aucun des cas... Send friend request
                // TODO PUSH
            });
        }



    });
};

exports.addFriends = function(req, res, next) {
    //req.checkBody('requestList')
    //req.checkBody('requestContactList')
    // if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    if(req.body.requestList.length > 0){
        var requestList = req.body.requestList;
        async.eachSeries(requestList, function iterator(userId, callback) {
            // if(req.user.friendRequest.indexOf(userId) > -1) {
            //     return res.json({
            //         message: 'FRIEND_REQUEST_ALREADY_SENT'
            //     });
            // }

            // if(req.user.friends.indexOf(userId) > -1) {
            //     return res.json({
            //         message: 'ALREADY_FRIENDS'
            //     });
            // }

            User.findOne({
                _id: userId,
                status: 'validated'
            }).exec(function(err, friend) {
                if(err) return next(err);
                if(!friend) return next(new Error('User not found'));

                if(friend.friends.indexOf(req.user._id) > -1) {
                    req.user.friends.push(userId);
                    req.user.save(function(err) {
                        if(err) return next(err);

                        notification.sendNotification(
                            req.user,
                            [friend],
                            req.user.firstName + " " + req.user.lastName + " is now your friend",
                            {type: 'FRIENDS', data: req.user._id}
                        );

                        Notification.findByIdAndUpdate(req.body.notif_id, { $set: { seen: true }});
                        callback();

                        /*
                         return res.send({
                         status : 1,
                         message: 'FRIENDS'
                         });*/
                    });

                } else if(friend.friendRequest.indexOf(req.user._id) > -1) {
                    callback();
                    /*var keyFriend = friend.friendRequest.indexOf(req.user._id);

                     friend.friendRequest.splice(keyFriend, 1);
                     friend.friends.push(req.user._id);

                     req.user.friendRequest.splice(friend._id, 1);
                     req.user.friends.push(friend._id);

                     friend.save(function(err) {
                     if(err) return next(err);

                     req.user.save(function(err) {
                     if(err) return next(err);

                     notification.sendNotification(
                     req.user,
                     [friend],
                     req.user.firstName + " " + req.user.lastName + " is now your friend",
                     {type: 'FRIENDS', data: req.user._id}
                     );

                     Notification.findByIdAndUpdate(req.body.notif_id, { $set: { seen: true }});
                     callback();
                     return res.send({
                     status : 1,
                     message: 'FRIENDS'
                     });
                     });
                     });*/

                } else {
                    req.user.friendRequest.push(userId);
                    req.user.save(function(err) {
                        if(err) return next(err);

                        notification.sendNotification(
                            req.user,
                            [friend],
                            req.user.firstName + " " + req.user.lastName + " wants to be friends with you",
                            {type: 'FRIEND_REQUEST', data: req.user._id}
                        );

                        notification.sendNotification(
                            friend,
                            [req.user._id],
                            "You have sent request to " + friend.firstName + " " + friend.lastName,
                            {type: 'FRIEND_REQUEST_SELF', data: req.user._id}
                        );

                        callback();
                        /* return res.send({
                         status : 1,
                         message: 'FRIEND_REQUEST_SENT'
                         });*/

                        // Aucun des cas... Send friend request
                        // TODO PUSH
                    });
                }

            });
        }, function done() {
            return res.send({
                status : 1,
                message: 'SUCCESS'
            });
        })
    }

 /*   if(req.body.requestContactList.length > 0){
        var requestContactList = req.body.requestContactList;
        var plivo = require('plivo');
        async.eachSeries(requestContactList, function iterator(number, callback) {
            console.log("calllllllllllllll" + number);
            var p = plivo.RestAPI({
                authId: 'MAMGU3MDK4OTQ5ZJMYNT',
                authToken: 'MjUxYjk5NGRjOWIzZTViY2U4MzcyZTFlMWNiNjFm'
            });
            var params = {'src': '1111111111','dst' : number,'text' : "MoodUP invitation",'method' : "GET"};
            p.send_message(params, function (status, response) {
                console.log('Status: ', status);
                console.log('API Response:\n', response);
                console.log('Message UUID:\n', response['message_uuid']);
                console.log('Api ID:\n', response['api_id']);
                callback();
            });
        }, function done() {
            return res.send({
                status : 1,
                message: 'SUCCESS'
            });
        })
    }*/
};

exports.rejectFriend = function(req, res, next) {
    req.checkBody('userId').notEmpty();
    req.checkBody('notif_id').notEmpty();

    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    var action = "";

    var logData = {
        user: req.user._id,
        state: 'USER'
    }

    User.findById(req.body.userId, function(err, friend) {
        if(err) return next(err);
        if(!friend) return next(new Error('User not found'));

        // remove from friend's friend request
        var idx = friend.friendRequest.indexOf(req.user._id);
        if(idx > -1) {
            friend.friendRequest.splice(idx, 1);
            logData.action = "REJ_REQ";
        }

        // remove from friend's friends
        idx = friend.friends.indexOf(req.user._id);
        if(idx > -1) {
            friend.friends.splice(idx, 1);
        }

        // remove from user's friend request
        idx = req.user.friendRequest.indexOf(friend._id);
        if(idx > -1) {
            req.user.friendRequest.splice(idx, 1);
            logData.action = "CNC_REQ";
        }

        // remove from user's friends
        idx = req.user.friends.indexOf(friend._id);
        if(idx > -1) {
            req.user.friends.splice(idx, 1);
            logData.action = "UNFRIEND";
        }

        friend.save(function(err) {
            if(err) return next(err);

            req.user.save(function(err) {
                if(err) return next(err);

                notification.sendNotification(
                    req.user,
                    [friend],
                    req.user.firstName + " " + req.user.lastName + " rejected your request.",
                    {type: 'FRIEND_REQUEST_REJECTED', data: req.user._id}
                );

                Notification.findByIdAndUpdate(req.body.notif_id, { $set: { seen: true }},function(err){
                });

                notification.sendNotification(
                    friend,
                    [req.user._id],
                    "You have rejected "+ friend.firstName + " " + friend.lastName + " request.",
                    {type: 'FRIEND_REQUEST_REJECTED_SELF', data: req.user._id}
                );

                Logs.saveLogFromUser(logData);

                return res.json({
                    status : 1,
                    message: 'UNFRIEND'
                });
            });

        });

    });
};

exports.getMyProfile = function(req, res, next) {
    User
        .findOne({
            _id: req.user
        })
        .populate('mood')
        .populate({
            path: 'friends',
            select: 'firstName lastName fbId picture friends fbFriends'
        })
        .populate({
            path: 'fbFriends',
            select: 'firstName lastName fbId picture friends fbFriends'
        })
        .populate({
            path: 'friendRequest',
            select: 'firstName lastName fbId picture friends fbFriends'
        })
        .exec(function(err, user) {
            if(err) return next(err);

            // console.log("me:", user);

            return res.json({
                status : 1,
                message : "User profile",
                data: user
            });
        });
};

exports.getProfile1 = function(req, res, next) {
    req.checkParams('id').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    User
        .findOne({
            _id: req.params.id
            // status: 'validated'
        })
        .select('firstName lastName description fbId friends mood picture location.city friendRequest')
        // no more facebook friend suggestions    app.post('/api/location', [access.requiresLogin], user.updateLocation);

        // .populate({
        //     path: 'fbFriends',
        //     match: {
        //         _id: { $in: req.user.fbFriends },
        //         status: 'validated'
        //     }
        // })
        .populate({
            path: 'friends',
            match: {
                _id: { $in: req.user.friends },
                status: 'validated'
            },
            select: 'firstName lastName fbId picture'
        })
        .populate('mood')
        .populate({ //remove friendRequest when old app is gone
            path: 'friendRequest',
            populate: {
                path: 'mood',
                model: 'Mood'
            },
            select: '_id'
        })
        .lean()
        .exec(function(err, mooder) {
            if(err) return next(err);

            if (mooder && mooder.notifications) delete mooder.notifications;
            return res.json({
                data: mooder
            });
        });
};

exports.updateLocation = function(req, res, next) {
    req.checkBody('lng').notEmpty();
    req.checkBody('lat').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    req.user.location.date = new Date();
    req.user.location.geo.coordinates = [req.body.lng, req.body.lat];
    var city;

    // Reverse Geocoding
    geocoder.reverseGeocode(req.body.lat, req.body.lng, function (err, data) {
        if(data && data.results && data.results.length) {
            for(var i = 0; i < data.results.length; i++) {
                if(data.results[i].types[0] == 'locality' || data.results[i].types[0] == 'administrative_area_level_1') {
                    city = data.results[i].formatted_address;
                    break;
                }
            }
        }

        if(city) {
            req.user.location.city = city;
        }

        req.user.save();

        return res.json({
            message: 'OK'
        });
    });
};

exports.updateProfilePicture = function(req, res, next) {
    req.checkBody('imgUrl').notEmpty();
    req.checkBody('imgId').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    req.user.picture.imgUrl = req.body.imgUrl;
    req.user.picture.imgId = req.body.imgId;

    req.user.save(function(err) {
        return res.json({
            message: 'OK'
        });
    });
};

exports.updateDescription = function(req, res, next) {
    req.user.description = req.body.description;

    req.user.save(function(err) {
        return res.json({
            message: 'OK'
        });
    });
};

exports.updateUsername = function(req, res, next) {
    req.checkBody('username').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    User.find({
        _id: { $ne: req.user._id },
        username : req.body.username
    }).lean()
        .exec(function(err, data) {
            if(err) return next(err);

            if(data.length > 0){
                return res.json({
                    status: 0,
                    message : "Username already used"
                });
            }else{
                req.user.username = req.body.username;
                req.user.save(function(err) {
                    return res.json({
                        status: 1,
                        message : "Username updated successfully"
                    });
                });
            }

        });
    /**/
};

exports.updateNotifications = function(req, res, next) {
    req.checkBody('notifications').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    req.user.notifications = req.body.notifications;

    req.user.save(function(err) {
        return res.json({
            message: 'OK'
        });
    });
};

/*
 exports.searchUppers = function(req, res, next) {

 var terms = req.query.search.split(' ');

 // User.aggregate()
 //     .project({fullName: {$concat: ['$firstName', ' ', '$lastName']}})
 //     .match({fullName: re})

 var aggregation = [{
 $project: {
 fullName: {$concat: ['$firstName', ' ', '$lastName']},
 firstName: 1,
 lastName: 1,
 fbId: 1,
 picture: 1,
 }
 }, {
 $match: {
 _id: { $ne: req.user._id }
 }
 }];

 terms.forEach(function(term){
 var obj = {
 $match: {fullName: { $regex : new RegExp(".*" + term + ".*", 'i')} }
 }
 aggregation.push(obj)
 },this)

 User.aggregate(aggregation)
 .exec(function(err, results) {
 if(err) return next(err);

 var idList = [];
 idList = results.map(function(item) {
 return item._id;
 });

 console.log(idList);

 User.find({_id: {$in: idList} })
 .select('firstName lastName fbId mood picture')
 .populate('mood')
 .lean()
 .exec(function(err, searchedUsers) {
 if(err) return next(err);

 return res.json({
 data: searchedUsers
 });
 })

 // return res.json({
 //     data: results
 // });
 });
 };*/
exports.userlist=function(req,res,next)
{     

     User.find()
     .select('pic zipcode email username _id')
    .sort({createdAt:-1})
     .exec(function(err, users) {
    
       if (err) return next(err);

            return res.json({
                status : 1,
                data : users
        })

   });


}


exports.learnerVideos=function(req,res,next)
{     
    req.checkBody('learner_id').notEmpty();
    
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));


     Project.find({learner_object_id:req.body.learner_id,created_user:req.user._id})
     .select('thumb_url media_url title')
    .sort({createdAt:-1})
    .limit(10)
     .exec(function(err, videos) {
    
       if (err) return next(err);

            return res.json({
                status : 1,
                data : videos
        })

   });


}