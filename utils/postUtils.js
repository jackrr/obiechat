var dateUtils = require('./dateUtils');
var _ = require('underscore');

function cleanPost(userID, post) {
	if (userID == post.creatorID) {
		post.isTheirs = true;
	}
}

function cleanPosts(posts, userID) {
	_.each(posts, function(post) {
		cleanPost(userID, post);
	});
}

module.exports = {
		cleanPost: cleanPost,
		cleanPosts: cleanPosts
};