var fs = require('fs');
var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/config');
var path = require("path");
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');

var app = express();
var port = process.env.PORT || 5555;

var bodyParser = require('body-parser');

app.set('views',__dirname+'/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public')); 

//app.engine('.html', require('ejs').renderFile());

app.use(bodyParser.json({limit: '500mb'}));

app.use(bodyParser.urlencoded({limit: '500mb',extended: true}));

app.use(cookieParser());

app.use(expressSession({secret:'1q2w3e4r5t6y7u8io0p'}));

app.use(express.static('images'));

// Connect to mongodb
var connect = function () {
    var options = { server: { socketOptions: { keepAlive: 1 } } };
    mongoose.connect(config.db, options, function(err, db){
        if(err) console.log('error connexion : ' + err + ' -- ' + db);
        console.log('Connected to mongoose');
    });
};

connect();

mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);


// Bootstrap models
fs.readdirSync(__dirname + '/app/models').forEach(function (file) {
    if (~file.indexOf('.js')) require(__dirname + '/app/models/' + file);
});

// Bootstrap application settings
require('./config/express')(app);

// Bootstrap routes
require('./config/routes')(app);

// Launch Cron jobs
require('./config/cron')();

app.listen(port);

module.exports = app;
