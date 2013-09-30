var _ = require('underscore');
var postUtils = require('./postUtils');

function cleanTopics(topics) {
	_.each(topics, function(topic) {
		cleanTopic(topic);
	});
}

function cleanTopic(topic) {
	_.each(topic.posts, function(post) {
		console.log('cleaning post');
		postUtils.cleanPost(post);
	});
}

module.exports = {
		cleanTopics: cleanTopics,
		cleanTopic: cleanTopic
};