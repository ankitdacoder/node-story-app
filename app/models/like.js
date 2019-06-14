
var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var moment = require('moment');
var config = require('../../config/config');
var Schema = mongoose.Schema;


/**
 * User schema
 */

var LikeSchema = new Schema({
    post_id: {  type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
    user_id:  {  type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

LikeSchema.pre('save', function(next) {
    var like = this;
    like.updatedAt =  Date.now;
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

mongoose.model('Like', LikeSchema);