/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


/**
 * User schema
 */
var ActivitySchema = new Schema({
    startingDate: {type: Number},
    endingDate: {type: Number},
    title: {type: String},
    location: {
        name: {type: String},
        place: {type: String},
        geo: {
            type: [Number],  // [<longitude>, <latitude>]
            index: '2d'      // create the geospatial index
        }
    },
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    invited: {
        type: [{
            status: {type: Number, enum: [0, 1, 2], default: 0}, // 0 No answer, 1 participle,2 is not involved
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
        }]
    },
    invited_groups: {
        type: [{
            id: {type: mongoose.Schema.Types.ObjectId, ref: 'Group'},
            users: {
                type: [{
                    status: {type: Number, enum: [0, 1, 2], default: 0}, // 0 No answer, 1 participle,2 is not involved
                    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
                }]
            }
        }]
    },
    mood: {type: mongoose.Schema.Types.ObjectId, ref: 'Mood'},
    other_mood: {type: String},
    status: {type: String, enum: ['created', 'cancelled'], default: 'created'},
    createdAt: {type : Number, default: new Date().getTime()},
    updatedAt: {type : Number, default: new Date().getTime()},
    picture: {
        imgId: {type: String},
        imgUrl: {type: String}
    },
    comments: [{
        message: {type: String},
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        createdAt: {type: Number, default: new Date().getTime()}
    }],
    gallery: [{
        picture: {
            imgId: {type: String},
            imgUrl: {type: String}
        },
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        createdAt: {type: Number, default: new Date().getTime()}
    }]
});


ActivitySchema.pre('save', function(next) {
    var event = this;
    event.updatedAt = new Date().getTime();
    next();
});


/**
 * Register
 */

mongoose.model('Activity', ActivitySchema);
