var postUtils = require('../utils/postUtils');
var _ = require('underscore');

module.exports = function(app, events) {
	var userAuth = require('../auth/userAuth')(app.db.User);
	var errorUtils = require('../utils/errorUtils')(app, events);
	var notifyAll = errorUtils.notifyAll;
	var returnError = errorUtils.error;

	var Topic = app.db.Topic;
	var Post = app.db.Post;
	var User = app.db.User;
	var TopicPop = app.db.TopicPopInfo;

	function popInfos(previews, lastAccess, cb) {
		var queries = previews.length;
		_.each(previews, function(preview) {
			TopicPop.find({topicID: preview._id}, function(err, tp) {
				if (err) return cb(err);
				if (!tp[0]) return cb('no pop info!');
				preview.viewCount = tp[0].viewCount;
				if (lastAccess < tp[0].lastActivity) {
					preview.newPosts = true;
				}
				queries--;
				if (queries === 0) {
					return cb(null, previews);
				}
			});
		});
		if (queries === 0) {
			return cb(null, previews);
		}
	}

	app.get('/topics', userAuth.signedIn, function(req, res) {
		Topic.previewsPage(1, function(err, topics) {
			if(err) return returnError(req, res, 500, err, err);
			popInfos(topics, req.lastAccess, function(err, previews) {
				if(err) return returnError(req, res, 500, err, err);
				res.render('topicList', {topics: previews, user: req.user});
			});
		});
	});

	app.get('/topics/:page', userAuth.signedIn, function(req, res) {
		Topic.previewsPage(req.params.page, function(err, topics) {
			if(err) return returnError(req, res, 500, "Failed to find more topics", err);
			if (!topics.length) {
				return returnError(req, res, 404, "No more topics");
			}
			popInfos(topics, req.lastAccess, function(err, previews) {
				if(err) return returnError(req, res, 500, err, err);
				res.render('partials/topicPreviews', {topics: previews});
			});
		});
	});

	app.get('/topic/new', userAuth.signedIn, function(req, res) {
		res.render('newTopic', {user: req.user});
	});

	app.post('/topic', userAuth.signedIn, function(req, res) {
		User.find({_id: req.user.id}, function(err, users) {
			if (err) {
				return returnError(req, res, 500, "Failed to access db", err);
			}
			if (!users[0]) {
				return returnError(req, res, 403, "Invalid user");
			}
			var user = users[0];
			var topic = new Topic(req.body);
			topic.creatorID = user._id;
			Topic.createNew(topic, function(err, topic) {
				if (err) {
					return returnError(req, res, 400, "Try again", err);
				}
				notifyAll('topicNotification', {subject: 'New topic created', slug: topic.slug, name: topic.name});
				res.redirect('/topic/show/' + topic.slug);
			});
		});
	});

	app.get('/topic/show/:slug/:page', userAuth.signedIn, function(req, res) {
		Topic.getPosts(req.params.slug, req.user.id, function(err, topic, page) {
			if (err) {
				return returnError(req, res, 500, "Failed to find page", err);
			}
			res.render('partials/postPage', {page: page, user: req.user});
		}, req.params.page);
	});


	app.get('/topic/:slug/pageNumber', userAuth.signedIn, function(req, res) {
		Topic.getPageCount(req.params.slug, function(err, count) {
			if (err) {
				return returnError(req, res, 500, "Lookup failed", err);
			}
			res.send({page: count-1})
		});
	});

	app.get('/topic/show/:slug', userAuth.signedIn, function(req, res) {
		res.format({
			html: function() {
				Topic.previewsPage(1, function(err, topics) {
					if (err) return res.send(500);
					popInfos(topics, req.lastAccess, function(err, previews) {
						if(err) return returnError(req, res, 500, err, err);
						res.render('index', {topics: previews, user: req.user});
					});
				});
			},

			json: function() {
				Topic.getPosts(req.params.slug, req.user.id, function(err, topic, page) {
					if(err) {
						return returnError(req, res, 500, "Could not find topic "+req.params.slug, err);
					}
					var ret = {};
					app.render('partials/topicHeader', {topic: topic}, function(err, topicHeader) {
						if (err) return returnError(req, res, 500, "Render error", err);
						app.render('partials/postPage', {page: page, user: req.user}, function(err, posts) {
							if (err) return returnError(req, res, 500, "Render error", err);
							app.render('partials/postPageForm', {slug: topic.slug, anonymous: topic.anonymous}, function(err, postForm) {
								if (err) return returnError(req, res, 500, "Render error", err);
								res.send({ topicHeader: topicHeader, posts: posts, postForm: postForm, slug: topic.slug });
							});
						});
					});
				});
			}
		});
	});
	app.post('/topic/:slug/post', userAuth.signedIn, function(req, res) {
		// send the topic view
		User.find({_id: req.user.id}, function(err, users) {
			if (err) {
				return returnError(req, res, 500, "Bad lookup", err);
			}
			if (!users[0]) {
				return returnError(req, res, 404, "Invalid user");
			}
			if (!/\S/.test(req.body.body)) {
				return returnError(req, res, 200, {empty: true});
			}
			var user = users[0];
			req.body.creatorID = user._id;
			req.body.creatorName = user.displayName;
			req.body.officialName = user.officialName;
			var post = new Post(req.body);
			Topic.addPostToTopic(req.params.slug, post, function(err, success) {
				if (err) {
					return returnError(req, res, 500, "Failed to make post", err);
				}
				if (success) {
					events.emit('topicChanged'+req.params.slug);
				}
				res.send();
			});
		});
	});
};