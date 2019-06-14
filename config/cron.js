var mongoose = require('mongoose');
var Mood = mongoose.model('Mood');
var User = mongoose.model('User');

var discoveryMood = null;
var oneMinute = 60 * 1000;
var oneHour = 60 * oneMinute;
var oneDay = 24 * oneHour;

Mood.findOne({'name': 'Discovery'}, function(err, mood) {
    if(!err && mood) {
        discoveryMood = mood;       
    }
});

function updateUsers() {
    if(!discoveryMood) return;

    // var query = {
    //     lastAction: {$lte: Date.now() - oneDay},
    //     mood: {$ne: discoveryMood._id}
    // };

    var query = {
        lastAction: {$lte: Date.now() - oneDay}
    };

    // var update = {
    //     mood: discoveryMood._id
    // };

    var update = {
        available: 'later'
    };

    User.update(query, update, {multi: true}).exec(function(err, c) {});
}

module.exports = function() {
    setInterval(function(){
        updateUsers();
    }, 15 * oneMinute);
};