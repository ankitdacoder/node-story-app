/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


/**
 * User schema
 */

var FeedbackSchema = new Schema({
    date: {type: Date, default: Date.now},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    feedback: {type: mongoose.Schema.Types.Mixed}
});

/**
 * Register
 */

mongoose.model('Feedback', FeedbackSchema);
