/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


/**
 * User schema
 */

var FaqSchema = new Schema({
 faq_list: [{
        question:{type: String},
        answer :{type: String},
    }],
});

/**
 * Register
 */

mongoose.model('Faq', FaqSchema);
