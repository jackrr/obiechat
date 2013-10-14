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

module.exports = PostPage;