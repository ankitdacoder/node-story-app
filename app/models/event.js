/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


/**
 * User schema
 */
var EventSchema = new Schema({
    title: {type: String},
    description: {type: String},
    startingDate: {type: Date},
    endingDate: {type: Date},
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
    status: {type: String, enum: ['created', 'cancelled'], default: 'created'},
    createdAt: {type : Date, default: Date.now},
    updatedAt: {type : Date, default: Date.now}
});


EventSchema.pre('save', function(next) {
    var event = this;
    event.updatedAt = new Date();
    next();
});


/**
 * Register
 */

mongoose.model('Event', EventSchema);

/*
var EventSchema = new Schema({
    title: {type: String},
    description: {type: String},
    startingDate: {type: Date},
    endingDate: {type: Date},
    location: {
        name: {type: String},
        place: {type: String},
        geo: {
            type: [Number],  // [<longitude>, <latitude>]
            index: '2d'      // create the geospatial index
        }
    },
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    invited: [{
        status: {type: Number, enum: [0, 1, 2], default: 0}, // 0 No answer, 1 participle,2 is not`
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    }],
    mood: {type: mongoose.Schema.Types.ObjectId, ref: 'Mood'},
    status: {type: String, enum: ['created', 'cancelled'], default: 'created'},
    createdAt: {type : Date, default: Date.now},
    updatedAt: {type : Date, default: Date.now},
    picture: {
        imgId: {type: String},
        imgUrl: {type: String}
    },
    comments: [{
        message: {type: String},
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        createdAt: {type: Date, default: Date.now}
    }],
    gallery: [{
        picture: {
            imgId: {type: String},
            imgUrl: {type: String}
        },
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        createdAt: {type: Date, default: Date.now}
    }]
});
*/
