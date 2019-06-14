  var mongoose = require('mongoose');
 var Genre = mongoose.model('Genre');
 var Story = mongoose.model('Story');
 var Rating = mongoose.model('Rating');
 var Mylibrary = mongoose.model('Mylibrary');
 var Like = mongoose.model('Like');
 var _ = require('underscore');
 var async = require('async');
 var Share =mongoose.model('Share');

 exports.shareStory = function(req, res, next) {
     
      share = new Share();
      share.story_id = req.body.story_id;
      share.user_id=req.user._id;
      share.genre_id=req.body.genre_id;
      share.save(function(err, u) {
        if(err) return next(err);
          return res.json({
                            status : 1,
                            message : "Story shared successfully.",
                            
      })

 })
}

 exports.shareStorylist = function(req, res, next) {

     var limit=10;  
     var offset= (req.body.page_no - 1) * limit;
     Share.find({ user_id : req.user._id })
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
     .exec(function(err, sharestorylist) {
       
     if (err) return next(err);
    if(sharestorylist)
         {                 
            sharestorylist = JSON.parse(JSON.stringify(sharestorylist));
            async.forEachOf(sharestorylist, function (value, i, callback) {
              console.log(sharestorylist[i].story_id);
              sharestorylist[i].story_id.story_users = _.uniq(sharestorylist[i].story_id.story_users, function(u){ 
                return u.user.username; 
              });
               Like.count({story_id:sharestorylist[i].story_id._id,user_id:req.user._id},function(err , likecount)
                                    {
                                       
                                        if(likecount)
                                           {
                                              sharestorylist[i].is_liked = 1;
                                           }else
                                           {
                                                sharestorylist[i].is_liked = 0; 
                                           } 
                                           
                                                    
                                   })

                    Mylibrary.count({story_id:sharestorylist[i]._id,user_id:req.user._id},function(err , savecount)
                                    {
                                       
                                        if(savecount)
                                           {
                                              sharestorylist[i].is_saved = 1;
                                           }else
                                           {
                                              sharestorylist[i].is_saved = 0; 
                                           } 
                                           
                                                    
                                   })


               Rating.find({story_id:sharestorylist[i]._id})
                    .select('rating user_id')
                    .exec(function(err, rating) {
                        if (err) return next(err);

                        if(rating.length>0)
                        {  
                                  
 
                             // calculating average rating
                                var totalRating= 0;
                                _.each(rating,function(rat){ totalRating += rat.rating;});
                                var avgRating = totalRating /  rating.length;       
                                sharestorylist[i].avgRating = avgRating;
                                
                                //total rating user count

                                 sharestorylist[i].total_user_rating = rating.length;

                                Rating.count({story_id:sharestorylist[i]._id,user_id:req.user._id},function(err , count){
                                    if(count)
                                    {
                                        sharestorylist[i].is_rated = 1;

                                    }else
                                    {
                                        sharestorylist[i].is_rated = 0;   
                                    }


                                   
                                    
                                    callback();
                                })                                    
                               
                                
                        }else{
                             sharestorylist[i].avgRating = 0;
                             sharestorylist[i].is_rated = 0;
                             sharestorylist[i].total_user_rating = 0;
                             
                            callback();
                        }
                    })

             },function(err){
                return res.json({
                    status : 1,
                    data : sharestorylist,
                })
            })


           } 
       
       // return res.json({
       //                      status : 1,
       //                      data : sharestorylist
                            
       //                  })
              

   })
}

