var mongoose = require('mongoose');
var _ = require('underscore');
var async = require('async');
var postPageSchema = require('../schema/postPageSchema');
var PostPage = mongoose.model('PostPage', postPageSchema);

function findPostInPage(page, postID) {
	var post;
	_.each(page.posts, function(pagePost) {
		if (pagePost._id.equals(postID)) {
			post = pagePost;
			post.topicID = page.topicID;
		}
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

// PostPage.confirmWarn = function(pageID, postID, warnID, userID, cb) {
// 	// it is illegal to do double wildcards!
// 	PostPage.findOneAndUpdate({_id: pageID, 'posts._id': postID, 'posts.$.warns._id': warnID}, { $push: { 'posts.$.warns.$.confirmedBy': userID } }, function(err, page) {
// 		if (err) return cb(err);
// 		PostPage.findById(pageID, function(err, page) {
// 			var post = findPostInPage(page, postID)
// 			cb(null, post);
// 		});
// 	});
// };

PostPage.denyWarn = function(pageID, postID, warnID, userID, cb) {
	// right now not doing denies of warns
	PostPage.findOne({_id: pageID}, function(err, page) {
		if (err) return cb(err);
		console.log(page);
		cb(null, findPostInPage(page, postID));
	});
};

PostPage.updatePostsForUser = function(user, cb) {
	// remove the body projection once this query is shown to work!
	PostPage.find({ posts: { $elemMatch: { creatorID: user._id, creatorName: { $exists: true } } } }, function(err, pps) {
		if (err) return cb(err);
		var updateFunctions = [];
		_.each(pps, function(pp) {
			_.each(pp.posts, function(post) {
				updateFunctions.push(function(callback) {
					PostPage.findOneAndUpdate({ _id: pp._id, 'posts._id': post._id}, { $set: { 'posts.$.creatorName': user.displayName }}, function(err, pp) {
						if (err) return callback(err);
						callback();
					});
				});
			});
		});
		async.waterfall(updateFunctions, function (err, result) {
			cb(err);
		});
	});
}

module.exports = PostPage;