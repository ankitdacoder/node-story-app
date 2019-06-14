
var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var moment = require('moment');
var config = require('../../config/config');
var Schema = mongoose.Schema;


/**
 * User schema
 */

var AdminModelSchema = new Schema({
    email: {type: String},
    password : {type: String, set : setPassword},
    
});

AdminModelSchema.pre('save', function(next) {
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
AdminModelSchema.methods.comparePassword = function(password, userPassword, callback) {
    bcrypt.compare(password, userPassword, function(err, isPasswordMatch) {
        if (err)
            return callback(err);
        return callback(null, isPasswordMatch);
    });
};

mongoose.model('AdminModel', AdminModelSchema);