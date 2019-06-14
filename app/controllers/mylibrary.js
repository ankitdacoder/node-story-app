  var mongoose = require('mongoose');
 var Genre = mongoose.model('Genre');
 var Mylibrary = mongoose.model('Mylibrary');
 var _ = require('underscore');
 var Like = mongoose.model('Like');
 var Story = mongoose.model('Story');
 var Rating = mongoose.model('Rating');
 var async = require('async');


 exports.saveStoryLibrary = function(req, res, next) {
     
      mylibrary = new Mylibrary();
      mylibrary.story_id = req.body.story_id;
      mylibrary.user_id=req.user._id;
      mylibrary.genre_id=req.body.genre_id;
      mylibrary.save(function(err, u) {
        if(err) return next(err);
          return res.json({
                            status : 1,
                            message : "Story saved to library successfully.",
                            
      })

 })
}

//  exports.myLibrarylist = function(req, res, next) {

//     var limit=10;  
//     var offset= (req.body.page_no - 1) * limit;
     
//    Mylibrary.find({ user_id : req.user._id })
//      .populate({
//      path:"story_id"
//     })
//      .populate({
//      path:"genre_id",
//      select:"name"  
//     })
//      .exec(function(err, mylibrarylist) {

//      if (err) return next(err);
       
//        return res.json({
//                             status : 1,
//                             data : mylibrarylist
                            
//                         })
              

//    })
// }


 exports.myLibrarylist = function(req, res, next) {

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
     .exec(function(err, mylibrarylist) {
       
     if (err) return next(err);
    if(mylibrarylist)
         {                 
            mylibrarylist = JSON.parse(JSON.stringify(mylibrarylist));
            async.forEachOf(mylibrarylist, function (value, i, callback) {
              console.log(mylibrarylist[i].story_id);
              mylibrarylist[i].story_id.story_users = _.uniq(mylibrarylist[i].story_id.story_users, function(u){ 
                return u.user.username; 
              });

                  Like.count({story_id:mylibrarylist[i].story_id._id,user_id:req.user._id},function(err , likecount)
                                    {
                                       
                                        if(likecount)
                                           {
                                              mylibrarylist[i].is_liked = 1;
                                           }else
                                           {
                                                mylibrarylist[i].is_liked = 0; 
                                           } 
                                           
                                                    
                                   })
            
               Rating.find({story_id:mylibrarylist[i]._id})
                    .select('rating user_id')
                    .exec(function(err, rating) {
                        if (err) return next(err);

                        if(rating.length>0)
                        {  
                                  
 
                             // calculating average rating
                                var totalRating= 0;
                                _.each(rating,function(rat){ totalRating += rat.rating;});
                                var avgRating = totalRating /  rating.length;       
                                mylibrarylist[i].avgRating = avgRating;
                                
                                //total rating user count

                                 mylibrarylist[i].total_user_rating = rating.length;

                               callback();                                 
                               
                                
                        }else{
                             mylibrarylist[i].avgRating = 0;
                             mylibrarylist[i].total_user_rating = 0;
                             
                            callback();
                        }
                    })

             },function(err){
                return res.json({
                    status : 1,
                    data : mylibrarylist,
                })
            })


           } 
       
   })
}


