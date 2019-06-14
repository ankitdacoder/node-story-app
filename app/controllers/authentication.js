var mongoose = require('mongoose');
var Mood = mongoose.model('Mood');
var User = mongoose.model('User');
var moment = require('moment');
var request = require('request');
var jwt = require('jwt-simple');
var _ = require('underscore');
var config = require('../../config/config');
var qs = require('querystring');
var utils = require('../../lib/utils');
var notification = require('../../lib/notification');
var Event = require('../controllers/event');
var config = require('../../config/config');
var cloudinary = config.cloudinary;
var fs = require('fs');
var mysql = require('mysql');
var emailUtil = require('../../lib/email');




//new app code here
var Learner=mongoose.model('LearnerModel');



function rand(digits) {
    return Math.floor(Math.random()*parseInt('8' + '9'.repeat(digits-1))+parseInt('1' + '0'.repeat(digits-1)));
}




/*******************Register User service *****************/
exports.register_user = function(req, res, next) {

    req.checkBody('username').notEmpty();
    req.checkBody('email').notEmpty();
    req.checkBody('password').notEmpty();
    //req.checkBody('zipcode').notEmpty();

    console.log(req);
     
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    User.findOne({ username : req.body.username.toLowerCase() }).exec(function(err, user) {
        if (err) return next(err);

        if(!user){
            User.findOne({ email : req.body.email.toLowerCase() }).exec(function(err, user) {
                if (err) return next(err);

                if(!user){
                    
                    var token=Math.random().toString(36).substr(2, 10);
                    user = new User();
                    user.user_id=rand(5);
                    user.fname = req.body.firstName.toLowerCase();
                    user.lname = req.body.lastName.toLowerCase();
                    
                    user.username = req.body.username.toLowerCase();
                    user.gender=req.body.sex;
                    user.email = req.body.email;
                    user.password = req.body.password;
                    user.phoneNumber = req.body.phoneNo;
                    user.pic='';
                    user.token=token;
                    user.is_active=0;

                    user.save(function(err, u) {
                        if(err) return next(err);
                         var mailOptions = {
                        to: u.email,
                        subject: 'Welcome to Spectrum Reflect',
                        text:'Hi '+u.username.toUpperCase()+',\n\n'+
                             'Welcome to Spectrum Reflect! Click the confirmation link below to complete your registration and begin using your new learning tool.'+'\n\n'
                             +'http://' + req.headers.host + '/email/verification/'+token+'\n\n'+
                             'Having trouble registering with us? Write to support@spectrumapplabs.com'
                     };

                    emailUtil.sendEmail(mailOptions);

                        return res.json({
                            status : 1,
                            message : "User registered successfully.",
                            token : createJWT(user),
                            data : { _id : user._id, username : user.username,email : user.email,zipcode : user.zipcode,user_id:user.user_id,user_pic:user.pic}
                        })
                    })
                }else{
                    return res.json({
                        status : -1,
                        message : "Email Id is already in use."
                    })
                }
            })
        }else{
            return res.json({
                status : -2,
                message : "Username is already in use."
            })
        }
    })
}

/***************Register user service End**********************/

/***************Login user service**********************/
exports.login_user = function(req, res, next) {

        var username=req.body.email.toLowerCase();

        var criteria = (username.indexOf('@') === -1) ? {username: username} : {email: username};
         
        User.findOne(criteria).exec(function(err, user) {
            if (err) return next(err);
            if(user){
                user.comparePassword(req.body.password ,user.password, function(err , isMatch){
                    if(isMatch){

                        //  return res.json({
                        //     status : 1,
                        //     token : createJWT(user),
                        //     data : { _id : user._id, username : user.username,email : user.email,zipcode : user.zipcode,user_id:user.user_id,user_pic:user.pic},
                        //     message : "User logged in successfully."
                        // })

                          if(user.is_active)
                        {
                         //    return res.json({
                         //    status : 1,
                         //    token : createJWT(user),
                         //    data : { _id : user._id, username : user.username,email : user.email,zipcode : user.zipcode,user_id:user.user_id,user_pic:user.pic},
                         //    message : "User logged in successfully."
                         // })
                          var user_pic;


                         if(user.pic)
                         {
                            user_pic=user.pic;
                         }else
                         {
                             user_pic='user.png'; 
                         }

                           Learner.count({created_user: user._id}, function(err, learner_count) {
                              
                                return res.json({
                                status : 1,
                                token : createJWT(user),
                                data : { _id : user._id, username : user.username,email : user.email,zipcode : user.zipcode,user_id:user.user_id,user_pic:user_pic},
                                learner_count:learner_count,
                                message : "User logged in successfully."
                               })
                              
                              }); 

                        }else
                        {
                            return res.json({
                            status : -3
                        })

                        }
                       
                    }else{
                        return res.json({
                            status : -1
                        })
                    }
                })
            }else{
                return res.json({
                    status : -2
                })
            }
        })
}

/***************Login user service end**********************/

// Private function
function createJWT(user) {
    var payload = {
        sub: user._id,
        iat: moment().unix(),
        exp: moment().add(6, 'months').unix()
    };
    return jwt.encode(payload, config.TOKEN_SECRET);
}


/***************************Forgot password***************/
exports.forgotPassword = function(req, res, next){
    req.checkBody('email').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));
     
     var email=req.body.email;

    //var criteria = (username.indexOf('@') === -1) ? {username: username} : {email: username};
    User.findOne({email: email}, function(err, user){ 

    // User.findOne({ email : req.body.email }).exec(function(err, user) {
        if (err) return next(err);

        if(user){

                require('crypto').randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {

                    var mailOptions = {
                        to: user.email,
                        subject: 'Reset your password',
                        text:'Hi '+user.username.toUpperCase()+',\n\n'+ 
                        'You are receiving this email because you requested to change your password for Spectrum Reflect. If you did not make this request, please ignore the email.\n\n' +
                        'Please follow the link to change your password.'+'\n\n'+
                        'http://' + req.headers.host + '/api/reset/' + token + '\n\n'


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



/***************************End****************************/
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
/*var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'ejabberd'
});*/
//connection.connect();

function createXMPPUser(id){    
    var username = id;
    var password = "123456";
    var queryString = "INSERT INTO `ejabberd`.`users` (`username`, `password`, `serverkey`, `salt`, `iterationcount`, `created_at`) VALUES ('"+username+"', '"+password+"', '', '', '0', CURRENT_TIMESTAMP)";
    connection.query(queryString, function(err, rows, fields) {
        if (err) throw err;

        console.log('user created successfully');
    });
    return 1;
}

exports.register = function(req, res, next) {
    req.checkBody('email').notEmpty();
    req.checkBody('password').notEmpty();
    req.checkBody('username').notEmpty();

    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    User.findOne({ username : req.body.username }).exec(function(err, user) {
        if (err) return next(err);

        if(!user){
            User.findOne({ email : req.body.email }).exec(function(err, user) {
                if (err) return next(err);

                if(!user){

                    var token=Math.random().toString(36).substr(2, 10);
                    user = new User();
                    user.password = req.body.password;
                    user.email = req.body.email;
                    user.username = req.body.username;
                    user.userType = "CUSTOM";
                    user.token=token;
                    user.is_active=0;
                    user.save(function(err, u) {
                        if(err) return next(err);
                    //      var mailOptions = {
                    //     to: u.email,
                    //     subject: 'Verify your email address | Story share App',
                    //     // text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    //     // 'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    //     // 'http://' + req.headers.host + '/api/reset/' + token + '\n\n' +
                    //     // 'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                    //     text:'Dear '+u.username.toUpperCase()+',\n\n'+
                    //          'Thank you for showing interest in StoryShare App. Please click on the following link to complete the registration process.\n\n'
                    //          +'http://' + req.headers.host + '/email/verification/'+token+'\n\n'+
                    //          'If you have any questions, please contact us at support@storyshare.com'
                    // };

                    // emailUtil.sendEmail(mailOptions);

                        return res.json({
                            status : 1,
                            message : "User registered successfully.",
                            token : createJWT(user),
                            data : { _id : user._id, email : user.email, username : user.username, rewards : user.rewards}
                        })
                    })
                }else{
                    return res.json({
                        status : -1,
                        message : "Email Id is already in use."
                    })
                }
            })
        }else{
            return res.json({
                status : -2,
                message : "Username is already in use."
            })
        }
    })
}

exports.login = function(req, res, next) {
    req.checkBody('userType').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    if(req.body.userType == "TWITTER"){
        User.findOne({ socialId : req.body.socialId }).exec(function(err, user) {
            if (err) return next(err);

            if(!user){
                user = new User();
                user.userType = req.body.userType;
                user.fullname = req.body.fullname;
                user.email = req.body.email;
                user.phoneNumber = req.body.phoneNumber;
                user.pic = req.body.pic;
                user.dob = req.body.dob;
                user.socialId = req.body.socialId;
                user.is_active=1;
                //creating random username
                user.username = ((req.body.fullname).toLowerCase()).replace(/ /g,'') + _.random(0, 1000000);
            }else{
                user.fullname = req.body.fullname;
                user.pic = req.body.pic;
                user.dob = req.body.dob;
                user.phoneNumber = req.body.phoneNumber;
            }

            user.save(function(err, user) {
                if(err) return next(err);

                return res.json({
                    status : 1,
                    message : "User logged in successfully.",
                    token : createJWT(user),
                    data : {_id : user._id, fullname : user.fullname, email : user.email, pic : user.pic, dob : user.dob, phoneNumber : user.phoneNumber, rewards : user.rewards, username : user.username,is_view:user.is_view }
                })
            })
        })
    }else if(req.body.userType == "FB"){
        User.findOne({ socialId : req.body.socialId }).exec(function(err, user) {
            if (err) return next(err);

            if(!user){
                user = new User();
                user.userType = req.body.userType;
                user.fullname = req.body.fullname;
                user.email = req.body.email;
                user.pic = req.body.pic;
                user.dob = req.body.dob;
                user.socialId = req.body.socialId;
                user.is_active=1;
                //creating random username
                user.username = ((req.body.fullname).toLowerCase()).replace(/ /g,'') + _.random(0, 1000000);
            }else{
                user.fullname = req.body.fullname;
                user.pic = req.body.pic;
                user.dob = req.body.dob;
            }

            user.save(function(err, user) {
                if(err) return next(err);

                return res.json({
                    status : 1,
                    message : "User logged in successfully.",
                    token : createJWT(user),
                    data : {_id : user._id, fullname : user.fullname, email : user.email, pic : user.pic, dob : user.dob, rewards : user.rewards, username : user.username,is_view:user.is_view }
                })
            })
        })
    }else if(req.body.userType == "CUSTOM"){
        User.findOne({ username : req.body.username }).exec(function(err, user) {
            if (err) return next(err);

            if(user){
                user.comparePassword(req.body.password , user.password , function(err , isMatch){
                    if(isMatch){

                        // if(user.is_active)
                        // {
                        //      return res.json({
                        //     status : 1,
                        //     token : createJWT(user),
                        //     data : { _id : user._id, email : user.email, username : user.username, rewards : user.rewards},
                        //     message : "User logged in successfully."
                        // })

                        // }else
                        // {
                        //     return res.json({
                        //     status : -3,
                        //     message : "Please verify your account from your registered email-id."
                        // })

                        // }
                         return res.json({
                            status : 1,
                            token : createJWT(user),
                            data : { _id : user._id, email : user.email, username : user.username, rewards : user.rewards,is_view:user.is_view},
                            message : "User logged in successfully."
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
}

exports.userAvailability = function(req, res, next) {
    req.checkBody('type').notEmpty();
    req.checkBody('text').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    // checking email availability
    if(req.body.type == 1){
        User.findOne({ email : req.body.text }).exec(function(err, user) {
            if (err) return next(err);

            if(!user){
                return res.json({
                    status : 1,
                    message : "Email id available."
                })
            }else{
                return res.json({
                    status : -1,
                    message : "Email Id is already in use."
                })
            }
        })
    }

    // checking username availability
    if(req.body.type == 2){
        User.findOne({ username : req.body.text }).exec(function(err, user) {
            if (err) return next(err);

            if(!user){
                return res.json({
                    status : 1,
                    message : "Username available."
                })
            }else{
                return res.json({
                    status : -1,
                    message : "Username is already in use."
                })
            }
        })
    }
}

exports.forgotPassword1 = function(req, res, next){
    req.checkBody('email').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));
     
     var username=req.body.email;

     var criteria = (username.indexOf('@') === -1) ? {username: username} : {email: username};
    User.findOne(criteria, function(err, user){ 

    // User.findOne({ email : req.body.email }).exec(function(err, user) {
        if (err) return next(err);

        if(user){

            require('crypto').randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {

                    var mailOptions = {
                        to: user.email,
                        subject: 'Story App Password Reset',
                        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'http://' + req.headers.host + '/api/reset/' + token + '\n\n' +
                        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                    };

                    emailUtil.sendEmail(mailOptions);

                    return res.json({
                        status : 1,
                        message : "Password change link sent to your registered email id."
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

exports.saveNewPassword = function(req, res, next){

    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (user) {

                user.password = req.body.password;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function(err) {

                    var mailOptions = {
                        to: user.email,
                        from: 'passwordreset@demo.com',
                        subject: 'Your password has been changed',
                        text: 'Hello,\n\n' +
                        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                    };

                  //  emailUtil.sendEmail(mailOptions);

                    //return res.send('Your password has been changed.');
                      var msg='Password reset successfully.'
                      res.render('success', {
                         msg: msg
                         });

                });
        }else{
            return res.send('Password reset token is invalid or has expired.');
        }
    })
}


exports.resetPassword = function(req, res, next) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: new Date().getTime() } }, function(err, user) {
        if (!user) {
            return res.send('Password reset token is invalid or has expired.');
        }else{
            res.render('reset', {
                user: req.user
            });
        }
    });
};
/*exports.register = function(req, res, next) {
    req.checkBody('firstName').notEmpty();
    req.checkBody('lastName').notEmpty();
    req.checkBody('gender').notEmpty();
    req.checkBody('contactNumber').notEmpty();
    req.checkBody('contactNumber').notEmpty();
    req.checkBody('picture');
    req.checkBody('username');
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    var profile = req.body;

    User.findOne({$or : [{username: req.body.username},{contactNumber: { $regex : new RegExp(".*" + req.body.contactNumber + ".*", 'i')}}]}, function(err, user) {
        if (err) return next(err);
        if(!user){
            user = new User();
            user.fbId = "";
            user.contactNumber = profile.contactNumber;
            user.firstName = profile.firstName;
            user.lastName = profile.lastName;
            user.gender = profile.gender;
            user.username = profile.username;
            user.email = "";
            //user.birthDate = new Date(fbBirthdate[2], fbBirthdate[0]-1, fbBirthdate[1], 14);
            user.fbFriends = [];
            msg = 'USER_REGISTER';

            if(req.body.picture != ""){
                cloudinary.uploader.upload("data:image/jpg;base64,"+req.body.picture,
                function(err, image){
                    if (err) return new Error('UPLOAD_ERROR');
                    user.picture = {imgId: image.public_id,imgUrl: image.secure_url}
                    saveUser();
                });
            }else{
                user.picture = {imgId: "",imgUrl: ""}
                saveUser();
            }

            function saveUser(){
                user.save(function(err, u) {
                    if(err) return next(err);
                    User.findOne({_id: u})
                        .exec(function(err, userFull) {
                            if(err) return next(err);

                            var data = {
                                "username": userFull.username,
                                "gender": userFull.gender,
                                "lastName": userFull.lastName,
                                "firstName": userFull.firstName,
                                "contactNumber": userFull.contactNumber,
                                "fbId": userFull.fbId,
                                "_id": userFull._id,
                                "pic" : userFull.picture.imgUrl
                            }
                            createXMPPUser(data._id);
                            return res.json({
                                status : 1,
                                message: "user registered successfully",
                                token: createJWT(userFull),
                                data: data
                            });
                        });
                });
            }
        }else{
            if(user.username == req.body.username){
                return res.json({
                    status : 0,
                    message: "Username already used"
                });
            }

            if((user.contactNumber).indexOf(req.body.contactNumber) > -1){
            //if(user.contactNumber == req.body.contactNumber){
                if(user.is_moodup_user){
                    return res.json({
                        status : 0,
                        message: "user already registered"
                    });
                }else{
                    user.contactNumber = profile.contactNumber;
                    user.firstName = profile.firstName;
                    user.lastName = profile.lastName;
                    user.gender = profile.gender;
                    user.username = profile.username;
                    user.is_moodup_user = 1;
                    user.contactNumber = req.body.contactNumber;
                    user.save(function(err, u) {
                        if (err) return next(err);

                        User.findOne({_id: u})
                            .exec(function(err, userFull) {
                                if(err) return next(err);

                                var data = {
                                    "username": userFull.username,
                                    "gender": userFull.gender,
                                    "lastName": userFull.lastName,
                                    "firstName": userFull.firstName,
                                    "contactNumber": userFull.contactNumber,
                                    "fbId": userFull.fbId,
                                    "_id": userFull._id,
                                    "pic" : userFull.picture.imgUrl
                                }
                                createXMPPUser(data._id);
                                return res.json({
                                    status : 1,
                                    message: "user registered successfully",
                                    token: createJWT(userFull),
                                    data: data
                                });
                            });

                    })
                }
            }
        }
    });
}*/

/*exports.login = function(req, res, next) {
    req.checkBody('contactNumber').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    User.findOne({
        contactNumber: { $regex : new RegExp(".*" + req.body.contactNumber + ".*", 'i')},
        is_moodup_user : 1
    }).exec(function(err, user) {
            if (err) return next(err);
            if(user){
                var data = {
                    "username": user.username,
                    "gender": user.gender,
                    "lastName": user.lastName,
                    "firstName": user.firstName,
                    "contactNumber": user.contactNumber,
                    "fbId": user.fbId,
                    "_id": user._id,
                    "pic" : user.picture.imgUrl
                }
                return res.json({
                    status : 1,
                    message: "user login successfully",
                    token: createJWT(data),
                    data: data
                });

            }else{
                return res.json({
                    status : 0,
                    message: "user login failure"
                });
            }
        })
}*/

exports.fbLogin = function(req, res, next) {
    req.checkBody('accessToken').notEmpty();
    req.checkBody('contactNumber').notEmpty();
    req.checkBody('username').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));
    var fields = ['id','email','name','first_name','last_name','gender','birthday'];
    var graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + fields.join(',');
    var permissionUrl = 'https://graph.facebook.com/v2.5/me/permissions';
    var friendsUrl = 'https://graph.facebook.com/v2.5/me/friends';

    var accessToken = {access_token: req.body.accessToken};
    var contactNumber = req.body.contactNumber;
    var username = req.body.username;
    // 1. Check if all permissions are granted
    request.get({ url: permissionUrl, qs: accessToken, json: true }, function(err, response, permissions) {
        if (err || !permissions.data || permissions.data.length == 0) return next(new Error('FB_PERMISSION_CHECK_ERROR'));

        for (var i = 0; i < permissions.data.length; i++) {
            if(permissions.data[i].status != 'granted') return next(new Error('FB_PERMISSION_NOT_GRANTED'));
        }

        // Get user data
        request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
            if (response.statusCode !== 200) return next(new Error('FB_GRAPH_ERROR'));

            //var fbBirthdate = profile.birthday.split('/');
            //if(fbBirthdate.length != 3) return next(new Error('FB_BIRTHDATE_ERROR'));

            // Get friends from fb
            request.get({ url: friendsUrl, qs: accessToken, json: true }, function(err, response, friends) {
                if (err) return next(new Error('FB_FRIENDS_CHECK_ERROR'));

                var friendsIds = friends.data.map(function (f) {
                    return f.id;
                });

                User.findOne({contactNumber: { $regex : new RegExp(".*" + req.body.contactNumber + ".*", 'i')}}, function(err, user1) {
                    if(err) return next(err);
                    User.findOne({fbId: profile.id}, function(err, user) {
                        if(err) return next(err);

                        // Convert users from friends
                        User.find({fbId: {$in: friendsIds}}).exec(function(err, userFBFriends) {
                            var msg;
                            if(user) {
                                user.fbFriends = userFBFriends;
                                user.contactNumber = contactNumber;
                                user.username = username;
                                msg = 'USER_LOGIN';
                                saveUser(user , msg);
                            } else {

                                if(user1){
                                    if(!user1.is_moodup_user){
                                        user1.fbId = profile.id;
                                        user1.email = profile.email;
                                        user1.firstName = profile.first_name;
                                        user1.lastName = profile.last_name;
                                        user1.gender = profile.gender;
                                        user1.fbFriends = userFBFriends;
                                        user1.contactNumber = contactNumber;
                                        user1.username = username;
                                        user1.picture = {imgId: profile.id,imgUrl: "http://graph.facebook.com/"+ profile.id +"/picture?type=large"}
                                        msg = 'USER_REGISTER';
                                        saveUser(user1 , msg);
                                    }else{
                                        user = new User();
                                        user.fbId = profile.id;
                                        user.email = profile.email;
                                        user.firstName = profile.first_name;
                                        user.lastName = profile.last_name;
                                        user.gender = profile.gender;
                                        user.fbFriends = userFBFriends;
                                        user.contactNumber = contactNumber;
                                        user.username = username;
                                        user.picture = {imgId: profile.id,imgUrl: "http://graph.facebook.com/"+ profile.id +"/picture?type=large"}
                                        msg = 'USER_REGISTER';
                                        saveUser(user , msg);
                                    }
                                }else{
                                    user = new User();
                                    user.fbId = profile.id;
                                    user.email = profile.email;
                                    user.firstName = profile.first_name;
                                    user.lastName = profile.last_name;
                                    user.gender = profile.gender;
                                    //user.birthDate = new Date(fbBirthdate[2], fbBirthdate[0]-1, fbBirthdate[1], 14);
                                    user.fbFriends = userFBFriends;
                                    user.contactNumber = contactNumber;
                                    user.username = username;
                                    user.picture = {imgId: profile.id,imgUrl: "http://graph.facebook.com/"+ profile.id +"/picture?type=large"}
                                    msg = 'USER_REGISTER';
                                    saveUser(user , msg);
                                }
                            }

                            function saveUser(user , msg){
                                user.save(function(err, u) {
                                    if(err) return next(err);
                                    User.findOne({_id: u})
                                        .exec(function(err, userFull) {
                                            if(err) return next(err);

                                            var data = {
                                                "username": userFull.username,
                                                "gender": userFull.gender,
                                                "lastName": userFull.lastName,
                                                "firstName": userFull.firstName,
                                                "contactNumber": userFull.contactNumber,
                                                "fbId": userFull.fbId,
                                                "_id": userFull._id
                                            }
                                            if(msg == 'USER_REGISTER')
                                                createXMPPUser(data._id);

                                            return res.json({
                                                status : 1,
                                                message: msg,
                                                token: createJWT(userFull),
                                                data: data
                                            });
                                        });
                                });
                            }
                        });
                    });

                })

                /*User.findOne({fbId: profile.id}, function(err, user) {
                    if(err) return next(err);

                    // Convert users from friends
                    User.find({fbId: {$in: friendsIds}}).exec(function(err, userFBFriends) {
                        var msg;
                        if(user) {
                            user.fbFriends = userFBFriends;
                            user.contactNumber = contactNumber;
                            user.username = username;
                            msg = 'USER_LOGIN';
                        } else {
                            user = new User();
                            user.fbId = profile.id;
                            user.email = profile.email;
                            user.firstName = profile.first_name;
                            user.lastName = profile.last_name;
                            user.gender = profile.gender;
                            //user.birthDate = new Date(fbBirthdate[2], fbBirthdate[0]-1, fbBirthdate[1], 14);
                            user.fbFriends = userFBFriends;
                            user.contactNumber = contactNumber;
                            user.username = username;
                            msg = 'USER_REGISTER';
                        }

                        user.save(function(err, u) {
                            if(err) return next(err);

                            var data = {
                                "username": u.username,
                                "gender": u.gender,
                                "lastName": u.lastName,
                                "firstName": u.firstName,
                                "contactNumber": u.contactNumber,
                                "fbId": u.fbId,
                                "_id": u._id
                            }
                            return res.json({
                                status : 1,
                                message: msg,
                                token: createJWT(u),
                                data: data
                            });
                        });
                    });

                    // Async Data : PushDevices, location
                });*/

            });

        });
    });
};

exports.registerPushNotification = function(req, res, next) {
    req.checkBody('token').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    var token = req.body.token;

    User.update({}, {$pullAll: {pushDevices: [token]}},  {multi: true});

    User.findById(req.user._id, '+pushDevices', function(err, user) {
        if(err) return next(err);
        if(!user.pushDevices) user.pushDevices = [];

        if(user.pushDevices.indexOf(token) == -1) {
            user.pushDevices.slice(0, 4); // Keep only last 4 devices
            user.pushDevices.unshift(token); // + this one = 5 devices. Enough.
            user.save();
        }

        return res.json({
            status : 1,
            message: 'OK'
        });
    });
};

exports.unRegisterPushNotification = function(req, res, next) {
    req.checkBody('token').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    var token = req.body.token;
    User.findById(req.user._id, function(err, user) {
        if(err) return next(err);

        if(!user.pushDevices) user.pushDevices = [];

        var idx = user.pushDevices.indexOf(token);

        if(idx != -1) {
            user.pushDevices.splice(idx, 1);
            user.save();
        }

        return res.json({
            status : 1,
            message: 'OK'
        });
    });
};

exports.registerLocation = function(req, res, next) {
    req.checkBody('token').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    var location = req.body.location;

    User.findById(req.user._id, '+location', function(err, user) {
        if(err) return next(err);

        user.location = {
            date: new Date()
        };

        return res.json({
            message: 'OK'
        });
    });
};

exports.verification = function(req, res, next) {
    // req.checkBody('token').notEmpty();
    // if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));
        
        User.findOne({ token : req.params.token}).exec(function(err, user) {
       if (user)
       {

        user.token='';
        user.is_active=1;
        user.save(function(err, u) {
                        if(err) return next(err);

                       //return res.send('Your account is active now.');
                     var msg='Thank you for completing the registration! You can start using the app now on your iPhone/iPad';
                      res.render('success_reg', {
                         msg: msg
                         });

                    })  
       
       }else
       {
         return res.send('Link is expire or already used.');
       }
    }); 
            
};


exports.upload = function(req, res, next) {

     console.log(views);
    //res.sendFile(path.join(__dirname+'/file-upload.html'));
          res.render('index');  
};



exports.postupdatePassword = function(req, res, next){

    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (user) {

 
                user.comparePassword(req.body.cpassword , user.password , function(err , isMatch){
                    if(isMatch){

                user.password = req.body.npassword;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function(err) {

                    var mailOptions = {
                        to: user.email,
                        from: 'passwordreset@demo.com',
                        subject: 'Your password has been changed',
                        text: 'Hello,\n\n' +
                        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                    };

                  //  emailUtil.sendEmail(mailOptions);

                    //return res.send('Your password has been changed.');
                      var msg='Password updated successfully.';
                      res.render('success', {
                         msg: msg
                         });

                });
                      
                    }else{
                        return res.json({
                            status : -1,
                            message : "Current Password not matched."
                        })
                    }
                })
         
        }else{
            return res.send('Password reset token is invalid or has expired.');
        }
    })
}


exports.getupdatePassword = function(req, res, next) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: new Date().getTime() } }, function(err, user) {
        if (!user) {
            return res.send('Password reset token is invalid or has expired.');
        }else{
            res.render('changePassword', {
                user: req.user
            });
        }
    });
};