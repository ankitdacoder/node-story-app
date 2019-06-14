var mongoose = require('mongoose');
var Logs = mongoose.model('Logs');

exports.saveLogFromView = function(req, res, next){
	var logData = req.body.logData;
	logData.user = req.user._id;

	// console.log(logData);

	Logs(logData).save(function(err, log) {
		if (err) return next(err);
		return res.json({
            data: log
        });
	});
};

exports.saveLogFromUser = function(logData){
	Logs(logData).save();
};

exports.updateLog = function (req, res, next){
	var q = { _id: req.body.logId };

	Logs.findOne(q, function (err, doc){
		doc.endDate = new Date();
		doc.save(function(err, log) {
			if (err) return next(err);
			return res.json({
                data: log
            });
		});
	});
}