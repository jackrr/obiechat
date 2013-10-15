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

function genSlug(str, cb) {
	var maxSlugLen = 25;
	var str = str.length < maxSlugLen ? str : str.substring(0, maxSlugLen);

	str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
  var to   = "aaaaaeeeeeiiiiooooouuuunc------";
  for (var i=0, l=from.length ; i<l ; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }
  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
  .replace(/\s+/g, '-') // collapse whitespace and replace by -
  .replace(/-+/g, '-'); // collapse dashes

  var taken = false;
  var index = 1;

  Topic.find({slug: new RegExp(str+'(\-\d+)?')}, function(err, topics) {
  	if (err) return cb(err);
  	if (topics && topics.length) {
  		if (topics.length > 1) {
  			var getNum = /.*\-(\d+)$/;
  			var nums = [];
  			_.each(topics, function(topic) {
  				var match = topic.slug.replace(str, '').replace('-', '');
  				console.log(match);
  				if (match) nums.push(parseInt(match));
  			});
  			var num = 1;
  			while (_.indexOf(nums, num) >= 0) {
  				num++;
  			}
  			str = str + '-' + num;
  		} else {
  			str = str + '-1';
  		}
  	}
  	cb(null, str);
  });
}

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

Topic.addPage = function(id, page, cb) {
	Topic.findOneAndUpdate({_id: id}, { $push: { postPages: page._id } }, cb);
};

Topic.createNew = function(topic, cb) {
	genSlug(topic.name, function(err, slug) {
		if (err) return cb(err);
		topic.slug = slug;
		topic.save(function(err) {
			if (err) {
				return cb(err);
			}
			PostPage.create({
				pageNumber: 1,
				topicID: topic._id
			}, function(err, newPage) {
				if (err) {
					return cb(err);
				}
				Topic.addPage(topic._id, newPage, function(err, upTopic) {
					if (err) {
						return cb(err);
					}
					cb(null, upTopic, newPage);
				});
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

Topic.getPageCount = function(slug, cb) {
	Topic.findBySlug(slug, 0, function(err, topic) {
		if (err) {
			return cb(err);
		}
		cb(null, topic.postPages.length);
	});
};

Topic.findPostsSince = function(slug, userID, date, cb) {
	// TODO: somehow check older pages if more posts?
	Topic.findBySlug(slug, userID, function(err, topic) {
		if (err) {
			return cb(err);
		}
		PostPage.findById(topic.postPages[topic.postPages.length - 1], function(err, page) {
			if (err) {
				return cb(err);
			}
			var posts = [];
			_.each(page.posts, function(post) {
				if (post.createdDate > date) {
					posts.push(post);
				}
			});
			postUtils.cleanPosts(posts, userID);
			cb(null, posts);
		});
	});
};

function writePosts(topic, cb) {
	PostPage.findById(topic.postPages[topic.postPages.length - 1], function(err, page) {
		if (err) return cb(err);
		var slots = page.postSlots;
		var asyncs = [];
		var posts = postQueues[topic._id];
		var index = 0;
		var subPosts = [];
		while (slots && posts[index]) {
			subPosts.push(posts[index]);
			slots--;
			index++;
		}
		if (!posts[index]) {
			delete postQueues[topic._id];
		}
		PostPage.addPosts(page._id, subPosts, function(err) {
			if (err) return cb(err);
			if (posts[index]) { // no more room for the posts in this page
				PostPage.create({
					pageNumber: topic.postPages.length + 1,
					topicID: topic._id,
				},
				function(err, newPage) {
					if (err) {
						return cb(err);
					}
					Topic.addPage(topic._id, newPage, function(err, upTopic) {
						if (err) {
							return cb(err);
						}
						postQueues[topic._id] = postQueues[topic._id].slice(index);
						return writePosts(upTopic, cb);
					});
				});
			} else {
				cb(null);
			}
		});
	});
}

function addPost(topic, post, cb) {
	if (postQueues[topic._id]) {
		postQueues[topic._id].push(post); // hopefully this happens in place because javascript is single threaded
		return cb(null, 'post added to queue');
	}
	postQueues[topic._id] = [post];
	writePosts(topic, function(err) {
		cb(err);
	});
}

Topic.addPostToTopic = function(slug, post, cb) {
	Topic.findBySlug(slug, 0, function(err, topic) {
		if (err) {
			return cb(err);
		}
		if (topic.anonymous) {
			post.creatorName = undefined;
		}
		addPost(topic, post, function(err, msg) {
			if (err) {
				return cb(err);
			}
			cb(null, true);
		});
	});
};

module.exports = Topic;