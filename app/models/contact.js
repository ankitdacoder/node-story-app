/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


/**
 * User schema
 */

var ContactSchema = new Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    text: {type: String},
    pictures: [{
        imgId: {type: String},
        imgUrl: {type: String}
    }]
});

/**
 * Register
 */

mongoose.model('Contact', ContactSchema);
