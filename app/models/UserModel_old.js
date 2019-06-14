
var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var moment = require('moment');
var config = require('../../config/config');
var Schema = mongoose.Schema;


/**
 * User schema
 */

var UserModelSchema = new Schema({
    user_id:{type: String},
    username : {type: String},
    email: {type: String},
    password : {type: String, set : setPassword},
    zipcode:{type: String},
    pic : {type: String},
    token:{type :String},
    is_active:{type :Number},
    resetPasswordToken: {type: String},
    resetPasswordExpires: {type : Number, default: Date.now},
    createdAt: {type : Number, default: Date.now},
 
});

UserModelSchema.pre('save', function(next) {
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
UserModelSchema.methods.comparePassword = function(password, userPassword, callback) {
    bcrypt.compare(password, userPassword, function(err, isPasswordMatch) {
        if (err)
            return callback(err);
        return callback(null, isPasswordMatch);
    });
};

mongoose.model('UserModel', UserModelSchema);