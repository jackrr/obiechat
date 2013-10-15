var mongoose = require('mongoose');
var _ = require('underscore');
var postPageSchema = require('../schema/postPageSchema');
var PostPage = mongoose.model('PostPage', postPageSchema);

PostPage.addPost = function(id, post, cb) {
	PostPage.findOneAndUpdate({_id: id}, { $push: { posts: post } }, cb);
};

PostPage.addPosts = function(id, posts, cb) {
	PostPage.findOneAndUpdate({_id: id}, { $push: { posts: { $each: posts } } }, cb);
};

PostPage.findPost = function(pageID, postID, cb) {
	PostPage.findById(pageID, function(err, page) {
		if (err) return cb(err);
		var post;
		_.each(page.posts, function(pagePost) {
			if (pagePost._id == postID) post = pagePost;
		});
		cb(null, post);
	})
};

module.exports = PostPage;