var geocoder = require('geocoder');
var mongoose = require('mongoose');
var Mood = mongoose.model('Mood');
var User = mongoose.model('UserModel');
var AdminModel = mongoose.model('AdminModel');
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
var moment = require('moment');
var jwt = require('jwt-simple');
var config = require('../../config/config');
// Expose
/* 
 * Get users depending on filters:
 * People: All, Friends, Uppers
 * Moods: Specified
 */
//new app code //


exports.userlist=function(req,res,next)
{     

     User.find()
     .select('pic zipcode email username _id')
    .sort({createdAt:-1})
     .exec(function(err, users) {

    if (err) return next(err);
       if(users)
         { 

          users = JSON.parse(JSON.stringify(users));  
          async.forEachOf(users, function (value, i, callback) {

                    Learner.count({created_user:users[i]._id},function(err , learnercount)
                                    {
                                        console.log("***********"+learnercount+"***"+i);
                                        if(learnercount)
                                           {
                                              users[i].learner_count = learnercount;
                                           }else
                                           {
                                                users[i].learner_count = 0; 
                                           } 
                                     
                                         callback();             
                                   })

                       
                 
             },function(err){
              
              console.log(users);
                return res.json({
                    status : 1,
                    data : users,
                })
            })


        

        }else
         {
             return res.json({
                            status : 2,
                            message : "No story found.",
                        })
         }            

   });


}


exports.dashboardCounts=function(req,res,next)
{     

User.count({is_active:1}).exec(function(err, usercount) {

Project.count().exec(function(err,projectcount){

Learner.count().exec(function(err,learnercount){

    if (err) return next(err);

            return res.json({
                status : 1,
                return_active_user : usercount,
                videocount:projectcount,
                learnercount:learnercount


        })
});
});

        

   });

}


exports.learnerlist=function(req,res,next)
{     

    //  var limit=10;  
    //  var offset= (req.body.page_no - 1) * limit;

    //  var is_search=req.body.is_search;
    //  var search_text=req.body.search_text;
      
    // if(is_search==1)
    // {
    //     var q={created_user: req.user._id,learner_name:{'$regex': search_text}};
    // }else
    // {
    //     var q={created_user: req.user._id};
    // }  

     
     Learner.find({created_user:req.body.id})
    .sort({createdAt:-1})
    .select('learner_id learner_name learner_age')
     .exec(function(err, learners) {
    
       if (err) return next(err);

          if(learners)
         { 

          learners = JSON.parse(JSON.stringify(learners));  
          async.forEachOf(learners, function (value, i, callback) {

                    Project.count({learner_object_id:learners[i]._id},function(err , videocount)
                                    {
                                        console.log("***********"+videocount+"***"+i);
                                        if(videocount)
                                           {
                                              learners[i].videocount = videocount;
                                           }else
                                           {
                                                learners[i].videocount = 0; 
                                           } 
                                     
                                         callback();             
                                   })

                       
                 
             },function(err){
              
              console.log(learners);
                return res.json({
                    status : 1,
                    data : learners,
                })
            })


        

        }else
         {
             return res.json({
                            status : 2,
                            message : "No story found.",
                        })
         } 

   });


}


exports.videolist=function(req,res,next)
{     

    //  var limit=10;  
    //  var offset= (req.body.page_no - 1) * limit;

    //  var is_search=req.body.is_search;
    //  var search_text=req.body.search_text;
      
    // if(is_search==1)
    // {
    //     var q={created_user: req.user._id,learner_name:{'$regex': search_text}};
    // }else
    // {
    //     var q={created_user: req.user._id};
    // }  

     var username="";
     var learnername="";

     Project.find({learner_object_id:req.body.id})
     .populate({
     path:"created_user" ,
     select:"username"  
    })
    .sort({createdAt:-1})

    //.select('learner_id learner_name learner_age')
     .exec(function(err, videos) {
    
       if (err) return next(err);
         
         username=videos[0].created_user.username;
         learnername=videos[0].learner_name;

          return res.json({
                    status : 1,
                    data : videos,
                    username:username,
                    learnername:learnername
                })

   });


}

/***************Login user service**********************/
exports.login_user = function(req, res, next) {

        var username=req.body.email.toLowerCase();
        var criteria = (username.indexOf('@') === -1) ? {username: username} : {email: username};
         
        AdminModel.findOne(criteria).exec(function(err, user) {
            if (err) return next(err);
            if(user){
                user.comparePassword(req.body.password ,user.password, function(err , isMatch){
                    if(isMatch){

                          return res.json({
                                status : 1,
                                token : createJWT(user),
                                //data : { _id : user._id, username : user.username,email : user.email,zipcode : user.zipcode,user_id:user.user_id,user_pic:user_pic},
                                //learner_count:learner_count,
                                message : "Logged in successfully."
                               })

                     
                       
                    }else{
                        return res.json({
                            status : -1,
                            message : "Password not matched."
                        })
                    }
                })
            }else{
                return res.json({
                    status : -2,
                    message : "Username not matched."
                })
            }
        })
}

/***************Login user service end**********************/


//delete user 

exports.deleteUser=function(req,res,next)
{ 

    User.remove({ _id:req.body._id }, function(err) {
    if (!err) {

        Learner.remove({created_user:req.body._id}).exec();
        Project.remove({created_user:req.body._id}).exec();

            return res.json({

                    message : "User deleted successfully."
                })
    }
    else {
            return res.json({

                    message : "User not deleted."
                })
    }
  });

 }


//end

// Private function
function createJWT(user) {
    var payload = {
        sub: user._id,
        iat: moment().unix(),
        exp: moment().add(6, 'months').unix()
    };
    return jwt.encode(payload, config.TOKEN_SECRET);
}