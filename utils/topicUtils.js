var _ = require('underscore');
var postUtils = require('./postUtils');
var dateUtils = require('./dateUtils');

function cleanTopics(topics) {
	_.each(topics, function(topic) {
		cleanTopic(topic);
	});
}

function cleanTopic(topic) {
	_.each(topic.posts, function(post) {
		postUtils.cleanPost(post);
	});
}

function cleanTopicPreviews(topics) {
	_.each(topics, function(topic) {
		// clean?
	});
}

module.exports = {
	cleanTopics: cleanTopics,
	cleanTopic: cleanTopic,
	cleanTopicPreviews: cleanTopicPreviews,
};