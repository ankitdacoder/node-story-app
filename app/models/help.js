/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


/**
 * User schema
 */

var HelpSchema = new Schema({
  text:{type:String}
});

/**
 * Register
 */

mongoose.model('Help', HelpSchema);
