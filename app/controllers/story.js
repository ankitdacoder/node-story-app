  var mongoose = require('mongoose');
 var Genre = mongoose.model('Genre');
 var Story = mongoose.model('Story');
 var Rating = mongoose.model('Rating');
 var Mylibrary = mongoose.model('Mylibrary');
 var Like = mongoose.model('Like');
 var Faq = mongoose.model('Faq');
 var Support = mongoose.model('Support');
 var Privacy = mongoose.model('Privacy');
 var Help = mongoose.model('Help');
 
 var _ = require('underscore');
 var async = require('async');



exports.ankit=function(req,res,next)
{
  console.log("I am here now");
}


 exports.createGenre = function(req, res, next) {
    genre = new Genre();
    genre.name = req.body.name;
    genre.createdBy = "588c83a3adb807207eeecdd3";
   
    genre.save(function(err, u) {
        if(err) return next(err);

        return res.json({
            status : 1,
            message : "Genre added successfully."
        })
    })
 }

 exports.getAllGenres = function(req, res, next) {
    Genre
        .find({})
        .select("name")
        .exec(function(err, list) {
        if(err) return next(err);
        return res.json({
            status : 1,
            message : "All Genres.",
            data: list
        });
    })  
 }

exports.create = function(req, res, next) {


     req.checkBody('genre_id').notEmpty();
     req.checkBody('story_title').notEmpty();
    //req.checkBody('user').notEmpty();
     req.checkBody('word_count').notEmpty();
     req.checkBody('story_text').notEmpty();
     req.checkBody('status').notEmpty();
    
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));
    
     story=new Story();
     story.genre_id=req.body.genre_id;
     story.story_title=req.body.story_title;
     story.story_owner=req.user._id;
     story.story_full_text=req.body.story_text;
     story.story_word_count=req.body.word_count;
     story.status=req.body.status;
     story.createdAt=Date.now();
     story.story_users.push({
        user: req.user._id,
        word_count : req.body.word_count,
        story_text :req.body.story_text
    });
    story.share_count=0;
    story.like_count=0;
    story.lastEdited_By=req.user._id;

    story.save(function(err, u) {
                        if(err) return next(err);
                        return res.json({
                            status : 1,
                            message : "Story created successfully.",
                            
                        })
                    })    


 }


exports.ongoingstory=function(req, res, next)
{
    /*
    console.log(Date.now());
    console.log('*********');
    console.log(new Date(Date.now() - 24*60*60 * 1000).getTime());

    return false; */
         var limit=10;  
     var offset= (req.body.page_no - 1) * limit;
    Story.find({story_owner:req.user._id,createdAt:{$gt:new Date(Date.now() - 24*60*60 * 1000).getTime()},status:1})
    .populate({
     path:"story_owner" , 
     select:"username"  
    })
    .populate({
     path:"genre_id" ,
     select:"name"  
    })
    .sort({createdAt:-1})
    .skip(offset).limit(limit)
    .exec(function(err, story) {

        if (err) return next(err);

          
         if(story)
         {
              return res.json({
                            status : 1,
                            data : story,
                            
                        })

         }else
         {
             return res.json({
                            status : 2,
                            message : "No story found.",
                            
                        })

         }

    })
   
 

}

exports.activestory=function(req, res, next)
{

     var limit=10;  
     var offset= (req.body.page_no - 1) * limit; 
    Story.find({status:2})
     .populate({
        path:"story_users.user",
        select:"username"
    })
    .populate({
     path:"genre_id",
     select:"name"  
    }).sort({createdAt:-1})
      .skip(offset).limit(limit)
    .exec(function(err, story) {
        if (err) return next(err);

         if(story)
         {                 
            //story =  story.toObject();
            story = JSON.parse(JSON.stringify(story));
            async.forEachOf(story, function (value, i, callback) {

              story[i].edit_users_list = _.uniq(story[i].story_users, function(u){ return u.user.username; });
                //story[i].story_users  = _.map(story_users, function(user){ return {_id : user.user._id ,username : user.user.username,word_count : user.word_count,story_text : user.story_text,updatedAt : user.updatedAt} });
                   
                    Like.count({story_id:story[i]._id,user_id:req.user._id},function(err , likecount)
                                    {
                                       
                                        if(likecount)
                                           {
                                              story[i].is_liked = 1;
                                           }else
                                           {
                                                story[i].is_liked = 0; 
                                           } 
                                           
                                                    
                                   })

                    Mylibrary.count({story_id:story[i]._id,user_id:req.user._id},function(err , savecount)
                                    {
                                       
                                        if(savecount)
                                           {
                                              story[i].is_saved = 1;
                                           }else
                                           {
                                              story[i].is_saved = 0; 
                                           } 
                                           
                                                    
                                   })
                   Rating.find({story_id:story[i]._id})
                    .select('rating user_id')
                    .exec(function(err, rating) {
                        if (err) return next(err);

                        if(rating.length>0)
                        {  
                                  
 
                             // calculating average rating
                                var totalRating= 0;
                                _.each(rating,function(rat){ totalRating += rat.rating;});
                                var avgRating = totalRating /  rating.length;       
                                story[i].avgRating = avgRating;
                                
                                //total rating user count

                                 story[i].total_user_rating = rating.length;

                                Rating.count({story_id:story[i]._id,user_id:req.user._id},function(err , count){
                                    if(count)
                                    {
                                        story[i].is_rated = 1;

                                    }else
                                    {
                                        story[i].is_rated = 0;   
                                    }


                                   
                                    
                                    callback();
                                })                                    
                               
                                
                        }else{
                             story[i].avgRating = 0;
                             story[i].is_rated = 0;
                             story[i].total_user_rating = 0;
                             
                            callback();
                        }
                    })
            },function(err){
//console.log("responser  >>>>>>>>>>> " + JSON.stringify(story));                
                return res.json({
                    status : 1,
                    data : story,
                })
            })
          /*  for(var i=0;i<story.length;i++)
            {                 
                // story[i].story_users = _.uniq(story[i].story_users, function(u){ return u.user.username; });
                  story[i].story_users = _.uniq(story[i].story_users, function(u){ return u.user.username; });
                   Rating.find({story_id:story[i]._id})
                     .select('rating')
                    .exec(function(err, rating) {
                        if (err) return next(err);

                        if(rating)
                        {                                
                            // calculating average rating
                                var totalRating= 0;
                                _.each(rating,function(rat){ totalRating += rat.rating; });
                                var argRating = totalRating /  rating.length;                         

                        }
                    })
            }           */

              

         }else
         {
             return res.json({
                            status : 2,
                            message : "No story found.",
                        })
         }
    })
 
}


 exports.update = function(req, res, next) {

     // req.checkBody('genre_id').notEmpty();
     // req.checkBody('story_title').notEmpty();
    
     req.checkBody('word_count').notEmpty();
     req.checkBody('story_text').notEmpty();
     req.checkBody('status').notEmpty();
     req.checkBody('story_id').notEmpty();
     req.checkBody('story_title').notEmpty();

    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));
     
     Story.findOne({ _id : req.body.story_id }).exec(function(err, story) {
       if (err) return next(err);
        // story.story_full_text=story.story_full_text+" "+req.body.story_text;
        // story.story_word_count=story.story_word_count+req.body.word_count;
        story.story_full_text=req.body.story_text;
        story.story_word_count=req.body.word_count;
        story.status=req.body.status;
        story.story_title=req.body.story_title;
        
        story.story_users.push({
        user: req.user._id,
        word_count : req.body.word_count,
        story_text :req.body.story_text
    }); 

    story.save(function(err, u) {
                        if(err) return next(err);

                        return res.json({
                            status : 1,
                            message : "Story Updated successfully.",
                            
                        })
                    })    

   })
 }


   exports.updateActiveStory = function(req, res, next) {

     // req.checkBody('genre_id').notEmpty();
     // req.checkBody('story_title').notEmpty();
    
     req.checkBody('word_count').notEmpty();
     req.checkBody('story_text').notEmpty();
     req.checkBody('status').notEmpty();
     req.checkBody('story_id').notEmpty();

    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));
     
     Story.findOne({ _id : req.body.story_id }).exec(function(err, story) {
       if (err) return next(err);
        //story.story_full_text=story.story_full_text+" "+req.body.story_text;
        //story.story_word_count=story.story_word_count+req.body.word_count;
        //story.story_full_text=req.body.story_text;
        // story.story_word_count=req.body.word_count;
        if(req.body.status!=1)
        {
           story.is_locked=0;
        }  
        story.status=req.body.status;
         
        story.lastEdited_By=req.user._id;
        
        story.story_users.push({
        
        user: req.user._id,
        word_count : req.body.word_count,
        story_text :req.body.story_text
    }); 

    story.save(function(err, u) {
                        if(err) return next(err);

                        return res.json({
                            status : 1,
                            message : "Story Updated successfully.",
                            
                        })
                    })    

   })
 }


 exports.lockStory = function(req, res, next) {
     
         Story.findOne({ _id : req.body.story_id}).exec(function(err, story) {
            
            if (err) return next(err);
            
            if(story.is_locked ==1)
            {
                  return res.json({
                            status : 2,
                            message : "Story Already Locked By Someone.",
                            
                        })

            }else
            {
                        story.is_locked=1;
                        story.lockedBy=req.user._id;
                        story.save(function(err, u) {
                        if(err) return next(err);

                        return res.json({
                            status : 1,
                            message : "Story Locked successfully.",
                            
                        })
                    })
            
            }
            
    

   })

 }



  exports.getFaq=function(req,res,next)
 {

      
               Faq.findOne({}).exec(function(err, faq) {
             if (err) return next(err);
                 return res.json({
                            status : 1,
                            data :faq.faq_list,                            
                        })

       
       // switch(type)
       // {
       //        case 1://FAQ
              
       //       Faq.findOne({}).exec(function(err, faq) {
       //       if (err) return next(err);
       //           return res.json({
       //                      status : 1,
       //                      data :faq.faq_list,                            
       //                  })

       //      })  

       //        break;
       //        case 2://support

       //          support.findOne({}).exec(function(err, support) {
       //       if (err) return next(err);
       //           return res.json({
       //                      status : 1,
       //                      data :support,                            
       //                  })

       //      })  
 
       //        break;
       //        case 3://privacy

       //           privacy.findOne({}).exec(function(err, privacy) {
       //       if (err) return next(err);
       //           return res.json({
       //                      status : 1,
       //                      data :privacy,                            
       //                  })

       //      })  
       //        break;
       //        case 4://help

       //           help.findOne({}).exec(function(err, help) {
       //       if (err) return next(err);
       //           return res.json({
       //                      status : 1,
       //                      data :help,                            
       //                  })

       //      })  
       //        break; 
       //        default:
       //        return res.json({
       //                      status : 2,
       //                      message : "No data Found!",
                            
       //                  })

       })





 }


  exports.getSupport=function(req,res,next)
 {
              Support.findOne({}).exec(function(err, support) {
             if (err) return next(err);
                 return res.json({
                            status : 1,
                            data :support.text,                            
                        })

               })
}              


  exports.getPrivacy=function(req,res,next)
 {
              Privacy.findOne({}).exec(function(err, privacy) {
             if (err) return next(err);
                 return res.json({
                            status : 1,
                            data :privacy.text,                            
                        })

               })
}              

  exports.getHelp=function(req,res,next)
 {
              Help.findOne({}).exec(function(err, help) {
             if (err) return next(err);
                 return res.json({
                            status : 1,
                            data :help.text,                            
                        })

               })
}              

