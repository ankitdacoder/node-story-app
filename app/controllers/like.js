  var mongoose = require('mongoose');
 var Genre = mongoose.model('Genre');
 var Like = mongoose.model('Like');
 var Story = mongoose.model('Story');
 var _ = require('underscore');
 var Rating = mongoose.model('Rating');
 var Mylibrary = mongoose.model('Mylibrary');
 var async = require('async');



 exports.likeStory = function(req, res, next) {

     var action=req.body.action;

       if(action)
      {


             like = new Like();
             like.story_id = req.body.story_id;
             like.user_id=req.user._id;
             like.genre_id=req.body.genre_id;
             like.save(function(err, u) {
             if(err) return next(err);
             Story.findOne({ _id : req.body.story_id }).exec(function(err, story) {
             if (err) return next(err);
             story.like_count=story.like_count+1;
             story.save(function(err, u) {
                        if(err) return next(err);

                        return res.json({
                            status : 1,
                            message : "Liked successfully.",
                            
                        })
                    })    

               })
             })
      }else
      {
           Like.findOneAndRemove({story_id:req.body.story_id,user_id:req.user._id}, function (err, todo) { 

              //console.log(todo); 
              //console.log(typeof(todo));        
              
                 Story.findOne({ _id : req.body.story_id }).exec(function(err, story) {
             if (err) return next(err);
             
             if(story.like_count>0)
             {    
              story.like_count=story.like_count-1;
             }
             story.save(function(err, u) {
                        if(err) return next(err);

                        return res.json({
                            status : 1,
                            message : "UnLiked successfully.",
                             
                        })
                    })    

               })
  
             });


       
      }

 

}

// exports.likedStorylist1 = function(req, res, next) {
       
//      var limit=10;  
//      var offset= (req.body.page_no - 1) * limit;

//      Like.find({ user_id : req.user._id })
//      .populate({
//      path:"genre_id",
//      select:"name"  
//     }).populate({
//      path:"story_id"
//     }).skip(offset).limit(limit)
//      .exec(function(err, likedlist) {
       
//      if (err) return next(err);
       
//        return res.json({
//                             status : 1,
//                             data : likedlist
                            
//                         })
              

//    })
 
// }




 exports.likedStorylist = function(req, res, next) {

     var limit=10;  
     var offset= (req.body.page_no - 1) * limit;
     Like.find({ user_id : req.user._id })
     .populate({
     path:"genre_id",
     select:"name"  
    }).populate({
     path:"story_id story_users",
     populate : {
        path:"story_users.user",
        select:"username"
     }
    }).
    skip(offset).limit(limit)
     .exec(function(err, likedlist) {
       
     if (err) return next(err);
    if(likedlist)
         {                 
            likedlist = JSON.parse(JSON.stringify(likedlist));
            async.forEachOf(likedlist, function (value, i, callback) {
              // console.log("****likedlist[i].story_id***");

              // console.log(likedlist[i]);

              if((likedlist[i].story_id.story_users).length)

              likedlist[i].story_id.story_users = _.uniq(likedlist[i].story_id.story_users, function(u){ 
                return u.user.username; 
              });

               Rating.find({story_id:likedlist[i]._id})
                    .select('rating user_id')
                    .exec(function(err, rating) {
                        if (err) return next(err);

                        if(rating.length>0)
                        {  
                                  
 
                             // calculating average rating
                                var totalRating= 0;
                                _.each(rating,function(rat){ totalRating += rat.rating;});
                                var avgRating = totalRating /  rating.length;       
                                likedlist[i].avgRating = avgRating;
                                
                                //total rating user count

                                 likedlist[i].total_user_rating = rating.length;

                               callback();                                 
                               
                                
                        }else{
                             likedlist[i].avgRating = 0;
                             likedlist[i].total_user_rating = 0;
                             
                            callback();
                        }
                    })

             },function(err){
                return res.json({
                    status : 1,
                    data : likedlist,
                })
            })


           } 
       
       // return res.json({
       //                      status : 1,
       //                      data : likedlist
                            
       //                  })
              

   })
}

