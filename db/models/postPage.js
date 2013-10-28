var mongoose = require('mongoose');
var _ = require('underscore');
var postPageSchema = require('../schema/postPageSchema');
var PostPage = mongoose.model('PostPage', postPageSchema);

function findPostInPage(page, postID) {
	var post;
	_.each(page.posts, function(pagePost) {
		if (pagePost._id.equals(postID)) post = pagePost;
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

PostPage.setWarnCountOnPost = function(pageID, postID, count, cb) {
	PostPage.findOneAndUpdate({_id: pageID, 'posts._id': postID}, { $set: { 'posts.$.warnCount': count } }, function(err, page) {
		if (err) return cb(err);
		cb(null, findPostInPage(page, postID));
	});
};

PostPage.setWarnGroupForPost = function(pageID, postID, wgID, count, cb) {
	PostPage.findOneAndUpdate({_id: pageID, 'posts._id': postID}, { $set: { 'posts.$.warnCount': count, 'posts.$.warnGroup': wgID } }, function(err, page) {
		if (err) return cb(err);
		cb(null, findPostInPage(page, postID));
	});
};

PostPage.confirmWarn = function(pageID, postID, warnID, userID, cb) {
	// it is illegal to do double wildcards!
	PostPage.findOneAndUpdate({_id: pageID, 'posts._id': postID, 'posts.$.warns._id': warnID}, { $push: { 'posts.$.warns.$.confirmedBy': userID } }, function(err, page) {
		if (err) return cb(err);
		PostPage.findById(pageID, function(err, page) {
			var post = findPostInPage(page, postID)
			cb(null, post);
		});
	});
};

PostPage.denyWarn = function(pageID, postID, warnID, userID, cb) {
	// right now not doing denies of warns
	PostPage.findOne({_id: pageID}, function(err, page) {
		if (err) return cb(err);
		console.log(page);
		cb(null, findPostInPage(page, postID));
	});
};

module.exports = PostPage;