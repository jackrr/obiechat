var _ = require('underscore');
var postUtils = require('./postUtils');
var dateUtils = require('./dateUtils');

function cleanTopics(userID, topics) {
	_.each(topics, function(topic) {
		cleanTopic(topic);
	});
}

function cleanTopic(userID, topic) {
	_.each(topic.posts, function(post) {
		postUtils.cleanPost(userID, post);
	});
}

function cleanTopicPreviews(topics) {
	_.each(topics, function(topic) {
		topic.posts = [];
	});
}

module.exports = {
	cleanTopics: cleanTopics,
	cleanTopic: cleanTopic,
	cleanTopicPreviews: cleanTopicPreviews,
};