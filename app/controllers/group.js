var mongoose = require('mongoose');
var Group = mongoose.model('Group');
var User = mongoose.model('User');
var utils = require('../../lib/utils');
var notification = require('../../lib/notification');
var Logs = require('../../lib/logs');
var _ = require('underscore');
var async = require('async');
/*var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'ejabberd'
});
connection.connect();*/

exports.createGroup = function(req, res, next) {
    req.checkBody('name').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

        group = new Group();
        group.name = req.body.name;
        group.user = req.user._id;

        var friendsList = req.body.friendsList;
        var contactList = req.body.contactList;
        var contactNumbers = _.pluck(contactList, "number");

        var regex = _.map(contactNumbers, function(k){ return new RegExp(".*" + k + ".*", 'i'); });
        User.find({
            _id: { $ne: req.user._id },
            'contactNumber': { '$in': regex }
        })
        .exec(function(err, contactFriend) {
            var contactNo = _.uniq(_.pluck(contactFriend, "contactNumber"));
            var friends = _.pluck(contactFriend, "_id");
                friends = _.uniq(_.union(friends , friendsList));
                var diff = _.difference(contactNumbers, contactNo);
                async.eachSeries(diff, function iterator(x, callback) {
                    if(name == null){
                        var name = _.find(contactList, function(usr){ return usr.number == x; }).name;
                    }else{
                        var name = "";
                    }
                    
                    user = new User();
                    user.fbId = "";
                    user.contactNumber = x;
                    user.firstName = name;
                    user.lastName = "";
                    user.gender = "male";
                    user.username = "";
                    user.is_moodup_user = 0;
                    user.email = "";
                    user.fbFriends = [];
                    user.picture = {imgId: "",imgUrl: ""};

                    user.save(function(err, u) {
                        if(err) callback();
                        friends.push(u._id);
                        callback();
                    })
                },function(done){
                    friends = _.map(friends, function(k){ return k.toString(); });                    
                    group.members = _.uniq(friends);
                    group.createdAt = new Date().getTime();
                    group.save(function(err , g){
                        if(err) return next(err);

                        req.user.groups.push(g._id);
                        req.user.save();

                        return res.json({
                            status : 1,
                            data : {id : g._id},
                            message: 'group created successfully'
                        });
                    })
                })
        })
}

exports.deleteGroup = function(req, res, next) {
    req.checkBody('id').notEmpty();

    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    // get the group
    Group.findOne({ _id: req.body.id }, function(err, group) {
        if(err) return next(err);

        if(group){
            // delete
            group.remove(function(err) {
                if (err) throw err;

                var index = req.user.groups.indexOf(req.body.id);
                req.user.groups.splice(index , 1);
                req.user.save();

                return res.json({
                    status : 1,
                    message: 'group deleted successfully'
                });
            });
        }else{
            return res.json({
                status : 0,
                message: 'group not exist'
            });
        }
    });
}

exports.updateGroup = function(req, res, next) {
    req.checkBody('id').notEmpty();

    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));
    Group.findOne( {'_id' : req.body.id }, function (err, group) {
        if(err) return next(err);

        if(req.body.name){
            group.name = req.body.name;
        }

        if(req.body.added.length){
            req.body.added.forEach(function(x){
                group.members.push(x);
            },this)
        }

        if(req.body.deleted.length){
            req.body.deleted.forEach(function(x){
                var index = group.members.indexOf(x);
                group.members.splice(index, 1);
            },this)
        }

        Group.update({ _id: req.body.id }, { $set: { members: group.members,name: group.name}}, function (err) {
            if(err) return next(err);

            return res.json({
                status : 1,
                message: 'group updated successfully'
            });
        });

    });

}

exports.getGroups = function(req, res, next) {
    User.findOne({_id: req.user._id})
        .populate({
            path: 'groups',
            select: 'name members createdAt',
            options: { sort: { createdAt: -1 }},
            populate: {
                path: 'members',
                select: 'firstName lastName contactNumber fbId is_moodup_user picture'
            }
        })
        .lean()
        .exec(function(err, groups) {
            if(err) return next(err);
            
            var grps = [];
            _.each(groups.groups , function(group){
                var members = [];
                _.each(group.members , function(u){
                    console.log("called >> " + JSON.stringify(u));
                    var user = {id : u._id,firstName : u.firstName,lastName : u.lastName,contactNumber : u.contactNumber,pic : u.picture.imgUrl,is_moodup_user : u.is_moodup_user};
                    members.push(user);
                    /*if(u.fbId != ""){
                        var pic = "http://graph.facebook.com/"+ u.fbId+"/picture?type=large";
                        var user = {id : u._id,firstName : u.firstName,lastName : u.lastName,contactNumber : u.contactNumber,pic : pic,is_moodup_user : u.is_moodup_user};
                        members.push(user);
                    }else{
                        var user = {id : u._id,firstName : u.firstName,lastName : u.lastName,contactNumber : u.contactNumber,pic : "",is_moodup_user : u.is_moodup_user};
                        members.push(user);
                    }                */
                })
                grps.push({_id : group._id,name : group.name,members : members});                
            })

            return res.json({
                status: 1,
                message : "groups",
                data: grps
            });
        });
}

exports.getGroupDetail = function(req, res, next) {
    req.checkBody('id').notEmpty();
    if (req.validationErrors()) return next(new Error('INPUT_VALIDATION_ERROR'));

    Group.findOne({_id: req.body.id})
        .select('name members')
        .populate({
            path: 'members',
            select: 'firstName lastName is_moodup_user fbId contactNumber picture'
        })
        .lean()
        .exec(function(err, group) {
            if(err) return next(err);

            var grps = [];
            var members = [];
            _.each(group.members , function(grp){
                var group = {id : grp._id,firstName : grp.firstName,lastName : grp.lastName,contactNumber : grp.contactNumber,pic : grp.picture.imgUrl,is_moodup_user : grp.is_moodup_user};
                members.push(group);
               /* if(grp.fbId != ""){
                    var pic = "http://graph.facebook.com/"+ grp.fbId+"/picture?type=large";
                    var user = {id : grp._id,firstName : grp.firstName,lastName : grp.lastName,contactNumber : grp.contactNumber,pic : pic,is_moodup_user : grp.is_moodup_user};
                    members.push(user);
                }else{
                    var user = {id : grp._id,firstName : grp.firstName,lastName : grp.lastName,contactNumber : grp.contactNumber,pic : "",is_moodup_user : grp.is_moodup_user};
                    members.push(user);
                }*/
            })

            grps.push({_id : group._id,name : group.name,members : members});
            console.log("called >> " + JSON.stringify(grps));
            return res.json({
                status: 1,
                message : "group detail",
                data: grps
            });
        });
}