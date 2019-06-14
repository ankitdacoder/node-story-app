/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


/**
 * User schema
 */

var StatisticSchema = new Schema({
    createdAt: {type: Date, default: Date.now},
    type: {type: String, enum: ['MOOD_CHANGED'], default: 'MOOD_CHANGED'},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    mood: {type: mongoose.Schema.Types.ObjectId, ref: 'Mood'}
});

/**
 * Register
 */

mongoose.model('Statistic', StatisticSchema);
