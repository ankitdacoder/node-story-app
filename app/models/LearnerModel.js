
var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var moment = require('moment');
var config = require('../../config/config');
var Schema = mongoose.Schema;


/**
 * User schema
 */

var LearnerSchema = new Schema({
    created_user:{type: mongoose.Schema.Types.ObjectId, ref: 'UserModel'},
    learner_id: {type: String},
    learner_name : {type: String},
    learner_age :  {type: String},
    learner_pic : {type: String},
    createdAt: {type: Number, default: Date.now}
});

LearnerSchema.pre('save', function(next) {
    var story = this;
    story.updatedAt =  (new Date()).getTime();
    next();
});


mongoose.model('LearnerModel', LearnerSchema);