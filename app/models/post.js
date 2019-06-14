
var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var moment = require('moment');
var config = require('../../config/config');
var Schema = mongoose.Schema;


/**
 * Post schema
 */

var PostSchema = new Schema({
    title:{type:String},
    description:{type:String},
    imgUrl:{type:String},
    post_owner:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type : Number, default: Date.now},
    status:{type: Number},
    cmnt_count:{type: Number,default:0},
    like_count:{type: Number,default:0}
});

PostSchema.pre('save', function(next) {
    var story = this;
    story.updatedAt =  (new Date()).getTime();
    next();
});
mongoose.model('Post', PostSchema);