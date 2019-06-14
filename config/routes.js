/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var multer  = require('multer');

// Controllers
var auth = require('../app/controllers/authentication');
var mood = require('../app/controllers/mood');
var user = require('../app/controllers/user');
var story = require('../app/controllers/story');
var rating = require('../app/controllers/rating');
var like = require('../app/controllers/like');
var mylibrary = require('../app/controllers/mylibrary');
var share = require('../app/controllers/share');



var event = require('../app/controllers/event');
var contact = require('../app/controllers/contact');
var group = require('../app/controllers/group');
var notification = require('../app/controllers/notification');
var communication = require('../app/controllers/communication');
var dash = require('../app/controllers/dashboard');
var logs = require('../lib/logs.js');
var web=require('../app/controllers/web');
// Middlewares
var access = require('../app/middlewares/authorization');

var admin= require('../app/controllers/admin');

//fakeBook

var post = require('../app/controllers/post');


/**
 * Expose
 */
module.exports = function (app) {
    // Auth Routes User


  //new app code here  
    
  //start 

  app.post('/api/auth/register_user',auth.register_user);   
  app.post('/api/auth/login_user', auth.login_user);


  app.post('/api/post/addPost',[access.requiresLogin],post.createPost);

  app.get('/api/post/getPost',[access.requiresLogin],post.readPost);
  app.post('/api/post/deletePost',[access.requiresLogin],post.removePost);
  app.post('/api/post/likePost',[access.requiresLogin],post.likepost);
  app.get('/api/user/getUser',[access.requiresLogin],user.getProfile);
   

    

  app.post('/api/user/add_learner',[access.requiresLogin],user.learner);
  
  app.post('/api/user/create_project',[access.requiresLogin],user.new_project);
  app.post('/api/user/recent_projects',[access.requiresLogin],user.recentProjects);
  app.post('/api/user/my_projects',[access.requiresLogin],user.projects);
  app.post('/api/user/get_learner_list',[access.requiresLogin],user.getLearnerList); 
  app.post('/api/user/update_profile',  [access.requiresLogin], user.updateProfile);
  app.post('/api/auth/forgot_password', auth.forgotPassword); 
  app.post('/api/user/getUserProfile', [access.requiresLogin],user.userProfile); 
  app.post('/api/user/editLearner', [access.requiresLogin],user.edit_learner);
  
  app.post('/api/user/update_password', [access.requiresLogin],user.updatePassword);
  app.post('/api/user/get_learnerVideos', [access.requiresLogin],user.learnerVideos);
  
    app.post('/api/user/videoPlayCount', [access.requiresLogin],user.play_count);
    
    

  //end
  
 app.post('/api/admin/loginadmin', admin.login_user);
 app.post('/api/admin/dashboard', [access.requiresLogin],admin.dashboardCounts);
 app.post('/api/admin/getUsersList', [access.requiresLogin],admin.userlist); 
 app.post('/api/admin/getLearnerList', [access.requiresLogin],admin.learnerlist); 
 app.post('/api/admin/getVideoList', [access.requiresLogin],admin.videolist); 
    



    
    app.get('/', web.index); //web
    app.get('/About', web.about); //web
    app.get('/Services', web.services); //web
    app.get('/Portfolio', web.portfolio); //web
    app.get('/Blog', web.blog); //web
    app.get('/Contact', web.contact); //web
    app.post('/send', web.submit); //contact form submit


    app.get('/addportfolio',web.addportfolio);
    

    app.get('/api/auth/upload', auth.upload); //storyapp
    app.post('/api/auth/register', auth.register); //storyapp
    app.post('/api/auth/login', auth.login); //storyapp
    app.post('/api/auth/user-availability', auth.userAvailability); //storyapp
    app.post('/api/auth/fblogin', auth.fbLogin);
    app.post('/api/auth/register-push', [access.requiresLogin], auth.registerPushNotification);
    app.post('/api/auth/unregister-push', [access.requiresLogin], auth.unRegisterPushNotification);

    //Dashboard
    app.post('/api/dashboard/note', [access.requiresLogin], dash.welcomeNote); //storypp
    app.post('/api/dashboard/get-rewards', [access.requiresLogin], dash.getRewards); //storypp

    // Mood
    app.get('/api/mood/moods', [access.requiresLogin], mood.getAllMoods); //new
    app.get('/api/mood/:action', [access.requiresLogin], mood.getMoods);
    app.post('/api/mood/current', [access.requiresLogin], mood.setMood);

    // User
    app.post('/api/user/forgot-password', auth.forgotPassword); //storyapp
    app.get('/api/reset/:token', auth.resetPassword); //storyapp
    app.post('/api/reset/:token', auth.saveNewPassword); //storyapp

    
    app.get('/api/update/:token', auth.getupdatePassword); //storyapp
    app.post('/api/update/:token', auth.postupdatePassword); //storyapp
 



    //email verification 
       //email verification 
    app.get('/email/verification/:token', auth.verification); //storyapp

    // Story
    app.post('/api/story/add-genre', story.createGenre); //storyapp
    app.post('/api/story/all-genres',  [access.requiresLogin], story.getAllGenres); //storyapp

    //rating
    app.post('/api/rating/addRating', [access.requiresLogin],rating.addRating); //storyapp
    
 
    // Create Story
    app.post('/api/story/create', [access.requiresLogin],story.create); //storyapp

    // user story list
    app.post('/api/story/ongoingstory',[access.requiresLogin], story.ongoingstory); //storyapp

        // activestory
    app.post('/api/story/activestory', [access.requiresLogin],story.activestory); //storyapp

 
     
    // Update Story
    app.post('/api/story/update', [access.requiresLogin],story.update); //storyapp

        // Update active Story
    app.post('/api/story/updateActiveStory', [access.requiresLogin],story.updateActiveStory); //storyapp
   
    //like story
    app.post('/api/like/likeStory', [access.requiresLogin],like.likeStory); //storyapp

        //like story list 
    app.post('/api/like/likedStorylist', [access.requiresLogin],like.likedStorylist); //storyapp
    
    //save to my library
     app.post('/api/mylibrary/saveStoryLibrary', [access.requiresLogin],mylibrary.saveStoryLibrary); //storyapp

     //my library list
     app.post('/api/mylibrary/myLibrarylist', [access.requiresLogin],mylibrary.myLibrarylist); //storyapp
    
     //share story
     app.post('/api/share/shareStory', [access.requiresLogin],share.shareStory); //storyapp
     
      //share story list
     app.post('/api/share/shareStorylist', [access.requiresLogin],share.shareStorylist); //storyapp

      //lock story 
     app.post('/api/story/lockStory', [access.requiresLogin],story.lockStory); //storyapp

     //get faq data
    app.get('/api/story/faq',story.getFaq); //storyapp
  
    //get support data
    app.get('/api/story/support', [access.requiresLogin],story.getSupport); //storyapp
    
        //get privacy data
    app.get('/api/story/privacy', [access.requiresLogin],story.getPrivacy); //storyapp
 

    //get support data
    app.get('/api/story/help', [access.requiresLogin],story.getHelp); //storyapp
 
     
    //get support data
    app.get('/api/story/ankit',story.ankit); //storyapp
 
  

    //User
    app.post('/api/user/update-profile',  [access.requiresLogin], user.updateProfile); //storyapp
    app.post('/api/user/get-profile',  [access.requiresLogin], user.getProfile); //storyapp

    app.get('/api/user/profile/me', [access.requiresLogin], user.getMyProfile);
    app.get('/api/user/mooders', [access.requiresLogin], user.getMooders);
    app.get('/api/user/uppers', [access.requiresLogin], user.getAllUppers);
    app.get('/api/user/tutorial', [access.requiresLogin], user.getTutorialUppers);
    app.post('/api/user/get-fbfriends', [access.requiresLogin], user.getFBFriends); // new

    app.post('/api/user/update-username', [access.requiresLogin], user.updateUsername); // new
    app.post('/api/user/get-fbcontact', [access.requiresLogin], user.getFBContact); // new
    app.post('/api/user/get-device-contact', [access.requiresLogin], user.getDeviceContact); // new
    app.get('/api/user/friends', [access.requiresLogin], user.getFriends);
    app.get('/api/user/all-friends', [access.requiresLogin], user.getAllFriends);

    app.get('/api/user/friendRequests', [access.requiresLogin], user.getFriendRequests);
    app.post('/api/user/suggestions', [access.requiresLogin], user.getSuggestions);
    // app.get('/api/user/suggestions', [access.requiresLogin], user.getSuggestions);
    app.post('/api/user/friend/accept', [access.requiresLogin], user.addFriend);
    app.post('/api/user/friend/unfriend', [access.requiresLogin], user.unFriend);
    app.post('/api/user/friend/add-friends', [access.requiresLogin], user.addFriends);
    app.post('/api/user/friend/reject', [access.requiresLogin], user.rejectFriend);
    app.post('/api/user/profile/edit-picture', [access.requiresLogin], user.updateProfilePicture);
    app.post('/api/user/profile/description', [access.requiresLogin], user.updateDescription);
    app.post('/api/user/profile/notifications', [access.requiresLogin], user.updateNotifications);
    //app.get('/api/user/profile/:id', [access.requiresLogin], user.getProfile);
    app.post('/api/location', [access.requiresLogin], user.updateLocation);

    // Group
    app.post('/api/group/create-group', [access.requiresLogin], group.createGroup); //new
    app.post('/api/group/delete-group', [access.requiresLogin], group.deleteGroup); //new
    app.post('/api/group/update-group', [access.requiresLogin], group.updateGroup); //new
    app.get('/api/group/get-groups', [access.requiresLogin], group.getGroups); //new
    app.post('/api/group/get-group-detail', [access.requiresLogin], group.getGroupDetail); //new

    // Event
    app.get('/api/event/calendar', [access.requiresLogin], event.getCalendar);
    app.get('/api/event/:id', [access.requiresLogin], event.getEvent);
    app.delete('/api/event/:id', [access.requiresLogin], event.cancelEvent);
    app.post('/api/activity/participation', [access.requiresLogin], event.setParticipation);
    app.get('/api/activity/activity-around', [access.requiresLogin], event.activityAround); // new
    app.post('/api/activity/create-activity', [access.requiresLogin], event.createActivity); //new
    app.get('/api/activity/get-activities', [access.requiresLogin], event.getActivities); //new
    app.get('/api/activity/get-new-activities', [access.requiresLogin], event.getNewActivities); //new
    app.post('/api/event/custom', event.createCustomEvent);

    // Event comments
    app.get('/api/event/:id/comments', [access.requiresLogin], event.getComments);
    app.post('/api/event/comments', [access.requiresLogin], event.postComment);

    // Event Pictures
    app.get('/api/event/:id/gallery', [access.requiresLogin], event.getGallery);
    app.post('/api/event/gallery', [access.requiresLogin], event.postPicture);

    app.post('/api/event/upload-picture', [access.requiresLogin, multer({dest:'./uploads/'}).single('file')], event.uploadPicture);
    app.post('/api/event/gallery/upload-picture', [access.requiresLogin, multer({dest:'./uploads/'}).single('file')], event.uploadGalleryPicture);
    app.post('/api/event', [access.requiresLogin], event.shareEvent);
    app.put('/api/event', [access.requiresLogin], event.updateEvent);
    app.post('/api/upload-media', event.uploadMedia);
    app.get('/upload-media', function(req,res){
        res.sendFile( "/var/www/html/moodup-server/views/file-upload.html");
    });
    //app.post('/api/upload-media',  event.uploadMedia);

    // Contact
    app.post('/api/contact/upload-picture', [access.requiresLogin, multer({dest:'./uploads/'}).single('file')], contact.uploadPicture);
    app.post('/api/contact', [access.requiresLogin], contact.sendContact);
    app.post('/api/contact/feedback', [access.requiresLogin], contact.sendFeedback);

    // Notification
    app.get('/api/notification/list', [access.requiresLogin], notification.getNotifications);
    app.post('/api/notification', [access.requiresLogin], notification.setSeen);
    app.post('/api/notification/all', [access.requiresLogin], notification.setSeenAll);

    // Communication // Team Moodup
    app.get('/api/communication', [access.requiresLogin], communication.getList);
    app.post('/api/communication', communication.add);

    // SEARCH
    app.get('/api/event/search', [access.requiresLogin], event.searchEvents);
    app.post('/api/user/search', [access.requiresLogin], user.search); // new

    // LOGS
    app.post('/api/logs/save', [access.requiresLogin], logs.saveLogFromView);
    app.post('/api/logs/update', [access.requiresLogin], logs.updateLog);

    /**
     * Error handling
     */

    app.use(function (err, req, res, next) {
        // treat as 404
        if (err.message
            && (~err.message.indexOf('not found')
            || (~err.message.indexOf('Cast to ObjectId failed')))) {
            return next();
        }

        if(!err || !err.message) {
            // unknown error
            return res.status(500).send({
                status : 0,
                type: 'error',
                message: 'UNKNOWN_ERROR'
            });
        }

        if(err.name == "MongoError") {
            var matches = /E11000 duplicate key error index: .*?\..*?\.\$(.*?)_\d+\s+dup key: { : (.*) }$/.exec(err.errmsg);
            if (matches) {
                return res.status(500).send({
                    status : 0,
                    type: 'error',
                    message: 'NOT_UNIQUE',
                    data: matches[1]
                });
            }
        }

        // handled error
        return res.status(500).send({
            status : 0,
            type: 'error',
            message: err.message
        });

    });

    // assume 404 since no middleware responded
    app.use(function (req, res, next) {
        return res.status(404).send({
            status : 0,
            url: req.originalUrl,
            error: 'Not found'
        });
    });
};
