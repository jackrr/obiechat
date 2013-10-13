var mongoose = require('mongoose');
var _ = require('underscore');
var async = require('async');
var topicSchema = require('../schema/topicSchema');
var Topic = mongoose.model('Topic', topicSchema);
var topicUtils = require('../../utils/topicUtils');
var postUtils = require('../../utils/postUtils');
var PostPage = require('./postPage');

var pagingBlocked = {};
var postQueues = {};

Topic.all = function(cb) {
	Topic.find({},function(err, topics) {
		topicUtils.cleanTopicPreviews(topics);
		cb(err, topics);
	});
};

//TODO: update this to work with paging (what use is userID?)
Topic.findBySlug = function(slug, userID, cb) {
	Topic.find({slug: slug}, function(err, topics) {
		if (topics && topics.length) {
			topicUtils.cleanTopic(userID, topics[0]);
			return cb(err, topics[0]);
		}
		cb(err, {});
	});
};

Topic.createNew = function(topic, cb) {
	topic.save(function(err) {
		PostPage.create({
			pageNumber: 1,
			topicID: topic._id,
		}, function(err, newPage) {
			if (err) {
				return cb(err);
			}
			Topic.addPage(topic._id, newPage, function(err, page) {
				if (err) {
					return cb(err);
				}
				cb(null, topic, page);
			});
		});
	});
};

Topic.getPosts = function(slug, userID, cb, page) {
	Topic.findBySlug(slug, userID, function(err, topic) {
		if (err) {
			return cb(err);
		}
		if (!page) {
			page = topic.postPages.length - 1;
		}
		PostPage.findById(topic.postPages[page], function(err, page) {
			if (err) {
				return cb(err);
			}
			postUtils.cleanPosts(page.posts, userID);
			cb(null, topic, page);
		});
	});
};

// TODO: update this to work with paging
Topic.findPostsSince = function(slug, userID, date, cb) {
	Topic.findBySlug(slug, userID, function(err, topic) {
		if (err) {
			return cb(err);
		}
		var posts = [];
		_.each(topic.posts, function(post) {
			if (post.createdDate > date) {
				posts.push(post);
			}
		});
		cb(null, posts);
	});
};

function addPost(topic, post, cb) {
	var pageID = topic.postPages[topic.postPages.length - 1];
	console.log(pageID);
	PostPage.addPost(pageID, post, function(err, oldPP) {
		if (err) {
			console.log('Couldnt save post to page: ', err);
			/*
			 * This is complicated.
			 */
			if (err.message == 'Page full') {
				if (pagingBlocked[topic._id]) {
					// some other request is creating the page!
					postQueues[topic._id].push(post);
					return cb(new Error('Post added to queue...'));
				}
				pagingBlocked[topic._id] = true; // prevent multiple new pages
				postQueues[topic._id] = [post];
				PostPage.create({
					pageNumber: topic.postPages.length + 1,
					topicID: topic._id,
				}, function(err, newPage) {
					if (err) {
						return cb(err);
					}
					Topic.addPage(topic._id, newPage, function(err, page) {
						if (err) {
							return cb(err);
						}
						// add all posts in queue to the page
						var asyncs = {};
						_.each(postQueues[topic._id], function(post, index) {
							asyncs[index] = function(callback) {
								addPost(topic, post, callback);
							};
						});
						async.parallel(asyncs, function(err, results) {
							if (err) {
								return cb(err);
							}
							delete postQueues[topic._id];
							delete pagingBlockedp[topic._id];
							cb(null);
						});
					});
				});
			}
			// other error
			return cb(err);
		}
		console.log('no error');
		// that was easy
		cb(null);
	});
};

Topic.addPostToTopic = function(slug, post, cb) {
	Topic.findBySlug(slug, 0, function(err, topic) {
		if (err) {
			return cb(err);
		}
		if (topic.anonymous) {
			post.creatorName = undefined;
		}
		addPost(topic, post, function(err) {
			if (err) {
				return cb(err);
			}
			cb(null, true);
		});
	});
};

module.exports = Topic;