var dateUtils = require('./dateUtils');
var _ = require('underscore');

function cleanPost(pageID, userID, post) {
	if (userID == post.creatorID) {
		post.isTheirs = true;
	}
	post.pageID = pageID;
}

function cleanPosts(posts, userID, pageID) {
	_.each(posts, function(post) {
		cleanPost(pageID, userID, post);
	});
}

module.exports = {
		cleanPost: cleanPost,
		cleanPosts: cleanPosts
};