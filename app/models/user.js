
var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var moment = require('moment');
var config = require('../../config/config');
var Schema = mongoose.Schema;


/**
 * User schema
 */

var UserSchema = new Schema({
    
    fname:{type:String},
    lname:{type:String},
    username : {type: String},
    email: {type: String},
    password : {type: String, set : setPassword},
    profilePic:{type:String},
    phoneNumber : {type: String},
    gender:{type:String},
    token:{type:String},
    is_active:{type :Number}
});

UserSchema.pre('save', function(next) {
    var user = this;
    user.lastAction = Date.now;
    next();
});

//changing plan password to hashed password
function setPassword (password) {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);
    return hash;
}

// comparing password
UserSchema.methods.comparePassword = function(password, userPassword, callback) {
    bcrypt.compare(password, userPassword, function(err, isPasswordMatch) {
        if (err)
            return callback(err);
        return callback(null, isPasswordMatch);
    });
};

/**
 * Validators
 */



/**
 * Register
 */

mongoose.model('User', UserSchema);