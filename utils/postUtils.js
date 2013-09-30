var dateUtils = require('./dateUtils');

function cleanPost(post) {
	post.browserDate = dateUtils.getReadableDate(post.createdDate);
}

module.exports = {
		cleanPost: cleanPost
};