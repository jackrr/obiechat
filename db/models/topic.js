var mongoose = require('mongoose');
var topicSchema = require('../schema/topicSchema');
var Topic = mongoose.model('Topic', topicSchema);

Topic.all = function(cb) {
	Topic.find({},function(err, topics) {
		cb(err, topics);
	});
};

Topic.findBySlug = function(slug, cb) {
	console.log(slug, '\nlooking it up now');
	Topic.find({slug: slug}, function(err, topics) {
		if (topics && topics.length) {
			return cb(err, topics[0]);	
		}
		cb(err, {});
	});
};
module.exports = Topic;