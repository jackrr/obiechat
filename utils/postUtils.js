var dateUtils = require('./dateUtils');
var _ = require('underscore');

function cleanPost(post, userID, pageID) {
	if (userID == post.creatorID) {
		post.isTheirs = true;
	}
	post.pageID = pageID;
}

function cleanPosts(posts, userID, pageID) {
	_.each(posts, function(post) {
		cleanPost(post, userID, pageID);
	});
}

module.exports = {
		cleanPost: cleanPost,
		cleanPosts: cleanPosts
};