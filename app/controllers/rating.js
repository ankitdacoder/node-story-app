  var mongoose = require('mongoose');
 var Genre = mongoose.model('Genre');
 var Rating = mongoose.model('Rating');
 var _ = require('underscore');

 exports.addRating = function(req, res, next) {
      rating = new Rating();
      rating.story_id = req.body.story_id;
      rating.user_id=req.user._id;
      rating.rating=req.body.rating;
      rating.save(function(err, u) {
        if(err) return next(err);

        return res.json({
            status : 1,
            message : "Rating added successfully."
        })
    })
 }
