var mongoose = require('mongoose');
var _ = require('underscore');
var postPageSchema = require('../schema/postPageSchema');
var PostPage = mongoose.model('PostPage', postPageSchema);

function findPostInPage(page, postID) {
		var post;
		_.each(page.posts, function(pagePost) {
			if (pagePost._id == postID) post = pagePost;
		});
		return post;
};

PostPage.addPost = function(id, post, cb) {
	PostPage.findOneAndUpdate({_id: id}, { $push: { posts: post } }, cb);
};

PostPage.addPosts = function(id, posts, cb) {
	PostPage.findOneAndUpdate({_id: id}, { $push: { posts: { $each: posts } } }, cb);
};

PostPage.findPost = function(pageID, postID, cb) {
	PostPage.findById(pageID, function(err, page) {
		if (err) return cb(err);
		cb(null, findPostInPage(page, postID));
	})
};

PostPage.addWarnToPost = function(pageID, postID, warn, cb) {
	PostPage.findOneAndUpdate({_id: pageID, 'posts._id': postID}, { $push: { 'posts.$.warns': warn } }, function(err, page) {
		if (err) return cb(err);
		cb(null, findPostInPage(page, postID));
	});
};

module.exports = PostPage;