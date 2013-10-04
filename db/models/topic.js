var mongoose = require('mongoose');
var topicSchema = require('../schema/topicSchema');
var Topic = mongoose.model('Topic', topicSchema);
var topicUtils = require('../../utils/topicUtils');

Topic.all = function(cb) {
	Topic.find({},function(err, topics) {
		topicUtils.cleanTopicPreviews(topics);
		cb(err, topics);
	});
};

Topic.findBySlug = function(slug, userID, cb) {
	Topic.find({slug: slug}, function(err, topics) {
		if (topics && topics.length) {
			topicUtils.cleanTopic(userID, topics[0]);
			return cb(err, topics[0]);	
		}
		cb(err, {});
	});
};
module.exports = Topic;