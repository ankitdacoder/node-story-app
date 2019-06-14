
var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var moment = require('moment');
var config = require('../../config/config');
var Schema = mongoose.Schema;


/**
 * User schema
 */

var ProjectSchema = new Schema({
    created_user:{type: mongoose.Schema.Types.ObjectId, ref: 'UserModel'},
    learner_object_id:{type: mongoose.Schema.Types.ObjectId, ref: 'LearnerModel'},
    learner_unique_id:{type: String},
    learner_name:{type: String},
    media_url : {type: String},
    createdAt: {type: Number, default: Date.now},
    title:{type: String},
    thumb_url:{type: String},
    play_count:{type: Number, default: 0},
});

ProjectSchema.pre('save', function(next) {
    var story = this;
    story.updatedAt =  (new Date()).getTime();
    next();
});

mongoose.model('ProjectModel', ProjectSchema);