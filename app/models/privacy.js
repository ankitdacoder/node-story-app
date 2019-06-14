/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


/**
 * User schema
 */

var PrivacySchema = new Schema({
  text:{type:String}
});

/**
 * Register
 */

mongoose.model('Privacy', PrivacySchema);
