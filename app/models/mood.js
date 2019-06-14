/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


/**
 * User schema
 */

var MoodSchema = new Schema({
    name: {type: String},
    color : {type: String},
    btn_color : {type: String},
    slogan: {type: String},
    uid: {type: String},
    position: {type: Number}
});

/**
 * Register
 */

mongoose.model('Mood', MoodSchema);
