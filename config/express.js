
/**
 * Module dependencies.
 */

var express = require('express');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var winston = require('winston');
var config = require('./config');
var pkg = require('../package.json');
var env = process.env.NODE_ENV || 'development';
var path = require('path');
var expressValidator = require('express-validator');
var cors = require('cors')

/**
 * Expose
 */

module.exports = function (app) {
    // Compression middleware (should be placed before express.static)
    app.use(compression({
        threshold: 512
    }));

    // Use winston on production
    var log;
    if (env !== 'development') {
        log = {
            stream: {
                write: function (message, encoding) {
                    winston.info(message);
                }
            }
        };
    } else {
        log = 'dev';
    }

    // expose package.json to views
    app.use(function (req, res, next) {
        //res.locals.pkg = pkg;
        res.locals.env = env;
        next();
    });

    // Logging middleware added after route
    app.use(function(req, res, next) {
        var date = new Date();
        //console.log(req.method + ' ' + req.url + ' ' + date);
        next();
    });

    app.use(cors());


    // bodyParser should be above methodOverride
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());

    app.use(expressValidator());

    app.use(methodOverride(function (req, res) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            // look in urlencoded POST bodies and delete it
            var method = req.body._method;
            delete req.body._method;
            return method;
        }
    }));

    app.disable('x-powered-by');

};