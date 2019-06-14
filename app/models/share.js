
var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var moment = require('moment');
var config = require('../../config/config');
var Schema = mongoose.Schema;


/**
 * User schema
 */

var ShareSchema = new Schema({
    story_id: {  type: mongoose.Schema.Types.ObjectId, ref: 'Story'},
    user_id:  {  type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    genre_id:  {  type: mongoose.Schema.Types.ObjectId, ref: 'Genre'},
});

ShareSchema.pre('save', function(next) {
    var share = this;
    share.updatedAt =  Date.now;
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

mongoose.model('Share', ShareSchema);