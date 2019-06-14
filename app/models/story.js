
var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var moment = require('moment');
var config = require('../../config/config');
var Schema = mongoose.Schema;


/**
 * User schema
 */

var StorySchema = new Schema({
    genre_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Genre'},
    story_title : {type: String},
    // story_full_text : {type: String},
    // story_word_count :{type: Number},
    story_owner:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    story_users: [{
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        word_count :{type: Number},
        story_text : {type: String},
        updatedAt: {type : Number, default: Date.now},
    }],
    createdAt: {type: Number, default: Date.now},
    updatedAt: {type : Number, default: Date.now},
    status:{type: Number},
    share_count:{type: Number,default:0},
    like_count:{type: Number,default:0},
    lastEdited_By:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    is_locked:{type: Number,default:0},
    lockedBy:{type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

StorySchema.pre('save', function(next) {
    var story = this;
    story.updatedAt =  (new Date()).getTime();
    next();
});

// //changing plan password to hashed password
// function setPassword (password) {
//     var salt = bcrypt.genSaltSync(10);
//     var hash = bcrypt.hashSync(password, salt);
//     return hash;
// }

// // comparing password
// UserSchema.methods.comparePassword = function(password, userPassword, callback) {
//     bcrypt.compare(password, userPassword, function(err, isPasswordMatch) {
//         if (err)
//             return callback(err);
//         return callback(null, isPasswordMatch);
//     });
// };

/**
 * Validators
 */



/**
 * Register
 */

mongoose.model('Story', StorySchema);