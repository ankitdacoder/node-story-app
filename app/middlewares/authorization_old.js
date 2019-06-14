var jwt = require('jwt-simple');
var moment = require('moment');
var config = require('../../config/config');
var mongoose = require('mongoose');
var User = mongoose.model('UserModel');


exports.requiresLogin = function(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(419).json({status : -1, message: 'Please make sure your request has an Authorization header' });
    }
    var token = req.headers.authorization;
    var payload = null;
    try {
        payload = jwt.decode(token, config.TOKEN_SECRET);
    }
    catch (err) {
        return res.status(419).json({ message: err.message });
    }

    if (payload.exp <= moment().unix()) {
        return res.status(419).json({ message: 'Token has expired' });
    }

    // User.findById(payload.sub, '', function(err, u) {
    //     if(err) {
    //         return res.status(419).json({
    //             status : 0,
    //             type: "error",
    //             message: err
    //         });
    //     }

    //     if(!u) {
    //         return res.status(419).json({
    //             status : -2,
    //             type: "error",
    //             message: "user not found"
    //         });
    //     }

    //     req.user = u;

    //     u.lastAction = new Date();
    //     u.save();

    //     next();
    // });

    next();
};


