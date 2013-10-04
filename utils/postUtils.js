var dateUtils = require('./dateUtils');

function cleanPost(userID, post) {
	if (userID == post.creatorID) {
		post.isTheirs = true;
	}
}

module.exports = {
		cleanPost: cleanPost
};