var mongoose = require('mongoose');
var topicSchema = require('../schema/topicSchema');
var Topic = mongoose.model('Topic', topicSchema);
var topicUtils = require('../../utils/topicUtils');

Topic.all = function(cb) {
	Topic.find({},function(err, topics) {
		// topicUtils.cleanTopics(topics);
		cb(err, topics);
	});
};

Topic.findBySlug = function(slug, cb) {
	console.log(slug, '\nlooking it up now');
	Topic.find({slug: slug}, function(err, topics) {
		if (topics && topics.length) {
			topicUtils.cleanTopic(topics[0]);
			return cb(err, topics[0]);	
		}
		cb(err, {});
	});
};
module.exports = Topic;