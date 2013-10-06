var mongoose = require('mongoose');
var _ = require('underscore');
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

Topic.findPostsSince = function(slug, userID, date, cb) {
	Topic.findBySlug(slug, userID, function(err, topic) {
		if (err) {
			return cb(err);
		}
		var posts = [];
		_.each(topic.posts, function(post) {
			if (post.createdDate > date) {
				posts.push(post);
			}
		});
		cb(null, posts);
	});
};

module.exports = Topic;