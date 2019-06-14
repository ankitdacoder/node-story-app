/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


/**
 * group schema
 */

var GroupSchema = new Schema({
    name: {type: String},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    members: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]},
    createdAt: {type : Number, default: new Date().getTime()}
});

/**
 * Register
 */

mongoose.model('Group', GroupSchema);
