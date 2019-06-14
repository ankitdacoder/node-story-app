var mongoose = require('mongoose');
var User = mongoose.model('User');
var Statistic = mongoose.model('Statistic');

exports.changeMood = function(user, newMood){
    Statistic({
        user: user,
        mood: newMood,
        type: 'MOOD_CHANGED'
    }).save();
};