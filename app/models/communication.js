/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


/**
 * User schema
 */

var CommunicationSchema = new Schema({
    title: {type: String},
    text: {type: String},
    createdAt: {type: Date},
    picture: {
        imgId: {type: String},
        imgUrl: {type: String}
    }
});

/**
 * Register
 */

mongoose.model('Communication', CommunicationSchema);
