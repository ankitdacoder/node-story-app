/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


/**
 * User schema
 */

var GenreSchema = new Schema({
 	name: {type: String},
 	createdBy : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
 	createdAt: {type : Number, default: new Date().getTime()},
    lastAction: {type : Number, default: new Date().getTime()}
});

/**
 * Register
 */

mongoose.model('Genre', GenreSchema);
