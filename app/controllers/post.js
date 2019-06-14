var mongoose = require('mongoose');
var PostModel = mongoose.model('Post');
var Like=mongoose.model('Like');
var config = require('../../config/config');
var async = require('async');
 var _ = require('underscore');
//create post
exports.createPost=function(req,res,nex)
{
 
  req.checkBody('title').notEmpty();
  req.checkBody('imageUrl').notEmpty();
  req.checkBody('description').notEmpty();
  req.checkBody('title').isLength({ min: 1, max:30 });
  
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

      post = new PostModel();
      post.title=req.body.title;
      post.description=req.body.description;
      post.imgUrl=req.body.imageUrl;
      post.post_owner=req.user._id;

    post.save(function(err) {
        if(err) return next(err);
        return res.json({
            data: 'OK'
        });
    });

}

//read post

exports.readPost=function(req,res,next)
{
    PostModel.find({})
     .sort({createdAt:-1})
     .exec(function(err, posts) {
      posts = JSON.parse(JSON.stringify(posts));
            async.forEachOf(posts, function (value, i, callback) {

                   Like.count({post_id:posts[i]._id,user_id:req.user._id},function(err , count){
                                    if(count)
                                    {
                                        posts[i].is_liked = true;

                                    }else
                                    {
                                        posts[i].is_liked = false;   
                                    }
                                     callback();
                                })


        },function(err){
                return res.json({
                    status : 1,
                    data : posts,
                })
            })


    })  
}

//remove post using id

exports.removePost=function(req,res,next)
{   
    req.checkBody('id').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));
    
    PostModel.remove({"_id":req.body.id}).exec(function(err, posts) {
        if(err) return next(err);
        return res.json({
            status : 1,
            message : "posts",
            data: posts
        });
    })  
}

//like post

exports.likepost=function(req,res,next){

    req.checkBody('postId').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));
  
    like =new Like();
    like.post_id=req.body.postId;
    like.user_id=req.user._id;

    like.save(function(err, u) {
             if(err) return next(err);
             PostModel.findOne({ _id : req.body.postId }).exec(function(err, post) {
             if (err) return next(err);
             post.like_count=post.like_count+1;
             post.save(function(err, u) {
                        if(err) return next(err);

                        return res.json({
                            status : 1,
                            message : "Liked successfully.",
                            
                        })
                    })    

               })
             })
}


// Expose
exports.sendContact = function(req, res, next) {
    req.checkBody('text').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

     user = new UserModel();

    var contactMessage = req.body;
    contactMessage.user = req.user._id;

    Contact(contactMessage).save(function(err) {
        if(err) return next(err);
        return res.json({
            data: 'OK'
        });
    });
};

exports.sendFeedback = function(req, res, next) {
    if(!Object.keys(req.body).length) return next(new Error('EMPTY_FEEDBACK'));

    Feedback({
        user: req.user._id,
        feedback: req.body
    }).save(function(err) {
        if(err) return next(err);

        return res.json({
            data: 'OK'
        });
    });
};


exports.uploadPicture = function(req, res, next) {
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
            });

        });
};