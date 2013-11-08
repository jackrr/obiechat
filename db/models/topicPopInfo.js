var mongoose = require('mongoose');
var _ = require('underscore');
var async = require('async');
var topicPopInfoSchema = require('../schema/topicPopInfoSchema');
var config = require('../../config.json');
var TopicPopInfo = mongoose.model('TopicPopInfo', topicPopInfoSchema);

TopicPopInfo.setViewCount = function(slug, viewCount, cb) {
	TopicPopInfo.findOneAndUpdate({slug: slug}, { $set: { viewCount: viewCount }}, cb);
};

TopicPopInfo.incPostCount = function(_id, cb) {
	TopicPopInfo.findOneAndUpdate({ topicID: _id }, { $inc: { postCount: 1 }, $set: { lastActivity: Date.now() } }, cb);
};

TopicPopInfo.decPostCount = function(_id, cb) {
	TopicPopInfo.findOneAndUpdate({ topicID: _id }, { $dec: { postCount: 1 }, $set: { lastActivity: Date.now() } }, cb);
};

TopicPopInfo.incWarnValue = function(_id, cb) {
	TopicPopInfo.findOneAndUpdate({ topicID: _id }, { $inc: { warnValue: 1 }, $set: { lastActivity: Date.now() } }, cb);
};


/*
Stuff for calculating the popularity
*/
TopicPopInfo.setPopularities = function(cb) {
	TopicPopInfo.find({}, function(err, tpis) {
		if (err) return cb(err);
		var updateFuncs = [];
		var pairs = [];
		_.each(tpis, function(tpi) {
			updateFuncs.push(function(callback) {
				TopicPopInfo.findOneAndUpdate({ _id: tpi._id }, { $set: { popularity: getPop(tpi), lastPopularity: tpi.popularity }}, function(err, upTpi) {
					if (err) return callback(err);
					pairs.push(_.pick(upTpi, 'topicID', 'popularity'));
					callback();
				});
			});
		});
		async.waterfall(updateFuncs, function(err, result) {
			cb(err, pairs);
		});
	});
};

function getPop(tpi) {
	var pop = (viewValue(tpi.viewCount) + postWarnValue(tpi.postCount, tpi.warnValue)) / ageValue(tpi.age);
	var oldpop = tpi.lastPopularity;
	console.log(pop, oldpop, oldpop + ((pop - oldpop) / config.pop.growthRate));
	if (pop > oldpop) {
		return oldpop + ((pop - oldpop) / config.pop.growthRate);
	}
	return oldpop + ((pop - oldpop) / config.pop.decayRate);
}

function postWarnValue(postCount, warnValue) {
	var pwRatio = 100 - config.pop.viewPercentage;
	postCount = postCount || 1;
	var pwValue = (postCount - (warnValue*warnValue))/ postCount;
	if (pwValue < 0) {
		pwValue = 0;
	}
	return pwValue * pwRatio;
}

function viewValue(viewcount) {
	var viewRatio = config.pop.viewPercentage;
	var viewCeiling = config.pop.viewCeiling;
	if (viewcount > viewCeiling) {
		viewcount = viewCeiling;
	}
	return (Math.sqrt(viewcount)/Math.sqrt(viewCeiling)) * viewRatio;
}

function ageValue(age) {
	var hour = 60 * 60;
	var day = hour * 24;
	var week = 7 * day;
	var month = 30 * day;
	var year = 365 * day;
	var cat;
	if (age > year) cat = "old";
	if (age > 6 * month) cat = "year";
	if (age > month) cat = "half-year";
	if (age > week) cat = "month";
	if (age > day) cat = "week";
	if (age > 12 * hour) cat = "day";
	if (age > 6 * hour) cat = "half-day";
	if (age > hour) cat = "quart-day";
	if (age > 30 * 60) cat = "hour";
	if (age > 15 * 60) cat = "half-hour";
	cat = "quart-hour";
	return config.pop.ageCats[cat];
};
module.exports = TopicPopInfo;
