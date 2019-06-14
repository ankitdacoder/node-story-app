/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * User schema
 */

var NotificationSchema = new Schema({
    seen: {type: Boolean, default: false},
    createdAt: {type: Number, default: new Date().getTime()},
    from: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    to: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    event: {type: mongoose.Schema.Types.ObjectId, ref: 'Activity'},
    type: {type: String},
    text:{type: String}
});

/**
 * Register
 */

mongoose.model('Notification', NotificationSchema);
