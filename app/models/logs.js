/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


/**
 * Logs schema
 */

var LogsSchema = new Schema({
    createdAt: {type: Date, default: Date.now},
    action: {type: String},
    state: {type: String},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    endDate: {type: Date}
});

/**
 * Register
 */

mongoose.model('Logs', LogsSchema);
