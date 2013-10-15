var userAuth = require('../auth/userAuth');
var postUtils = require('../utils/postUtils');

module.exports = function(app, events) {
	var Topic = app.db.Topic;
	var Post = app.db.Post;
	var User = app.db.User;

	app.get('/topics', userAuth.signedIn, function(req, res) {
		Topic.all(function(err, topics) {
			if(err) {
				console.log(err);
			}
			res.render('topicList', {topics: topics, user: req.user});
		});
	});

	app.get('/topic/new', userAuth.signedIn, function(req, res) {
		// send form to create a topic
		res.render('newTopic', {user: req.user});
	});

	app.post('/topic', userAuth.signedIn, function(req, res) {
		User.find({_id: req.user.id}, function(err, users) {
			if (err) {
				console.log(err);
			}
			if (!users[0]) {
				return res.send(403, "Invalid user");
			}
			var user = users[0];
			var topic = new Topic(req.body);
			topic.creatorID = user._id;
			if (topic.owned) {
				topic.creatorName = user.displayName;
			}
			Topic.createNew(topic, function(err, topic) {
				if (err) {
					console.log(err);
					res.send(400, "bad request");
				}
				res.redirect('/topic/show/' + topic.slug);
			});
		});
	});

	app.get('/topic/show/:slug/:page', userAuth.signedIn, function(req, res) {
		console.log(req.params.page);
		Topic.getPosts(req.params.slug, req.user.id, function(err, topic, page) {
			if (err) {
				return res.render('partials/alert', {error: err}, function(err, html) {
					if (err) {
						console.log(err);
						res.send({error: 'Something went wrong!'});
					}
					res.send({error: html});
				});
			}
			res.render('partials/postPage', {page: page, user: req.user});
		}, req.params.page);
	});

	app.get('/topic/:slug/pageNumber', userAuth.signedIn, function(req, res) {
		Topic.getPageCount(req.params.slug, function(err, count) {
			if (err) {
				console.log(err);
			}
			res.send({page: count-1})
		});
	});

	app.get('/topic/show/:slug', userAuth.signedIn, function(req, res) {
		// send the topic view
		Topic.getPosts(req.params.slug, req.user.id, function(err, topic, page) {
			if(err) {
				console.log(err);
			}
			res.render('topic', {topic: topic, user: req.user, postPage: page});
		});
	});

	app.post('/topic/:slug/post', userAuth.signedIn, function(req, res) {
		// send the topic view
		User.find({_id: req.user.id}, function(err, users) {
			if (err) {
				console.log(err);
			}
			if (!users[0]) {
				return res.send(404, "Invalid user");
			}
			var user = users[0];
			req.body.creatorID = user._id;
			req.body.creatorName = user.displayName;
			var post = new Post(req.body);
			Topic.addPostToTopic(req.params.slug, post, function(err, success) {
				if (err) {
					console.log(err);
					return res.render('partials/alert', {error: err}, function(err, html) {
						if (err) {
							console.log(err);
							res.send({error: 'Something went wrong!'});
						}
						res.send({error: html});
					});
				}
				if (success) {
					events.emit('topicChanged'+req.params.slug);
				}
				res.send();
			});
		});
	});
};