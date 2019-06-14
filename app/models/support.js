/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


/**
 * User schema
 */

var SupportSchema = new Schema({
  text:{type:String}
});

/**
 * Register
 */

mongoose.model('Support', SupportSchema);
