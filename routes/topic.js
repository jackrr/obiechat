var userAuth = require('../auth/userAuth');
var postUtils = require('../utils/postUtils');

module.exports = function(app) {
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
			topic.save(function(err) {
				if (err) {
					console.log(err);
				}
				res.redirect('/topic/' + topic.slug);
			});
		});
	});
	
	app.get('/topic/:slug', userAuth.signedIn, function(req, res) {
		// send the topic view
		Topic.findBySlug(req.params.slug, req.user.id, function(err, topic) {
			if(err) {
				console.log(err);
			}
			res.render('topic', {topic: topic, user: req.user});	
		});
	});
	
	app.post('/topic/:slug/post', userAuth.signedIn, function(req, res) {
		// send the topic view
		Topic.findBySlug(req.params.slug, null, function(err, topic) {
			if(err) {
				console.log(err);
			}
			if(!topic.name) {
				return res.send(404, "Topic not found");
			}
			User.find({_id: req.user.id}, function(err, users) {
				if (err) {
					console.log(err);
				}
				if (!users[0]) {
					return res.send(404, "Invalid user");
				}
				var user = users[0];
				var post = new Post(req.body);
				post.creatorID = user._id;
				console.log(post);
				if (!topic.anonymous) {
					post.creatorName = user.displayName;	
				}
				topic.posts.push(post);
				topic.save(function(err) {
					if(err) {
						console.log(err);
						topic.posts.remove(post._id);
						return res.render('partials/alert', {error: err}, function(err, html) {
							if (err) {
								console.log(err);
								res.send({error: 'Something went wrong!'});
							}
							res.send({error: html});
						});
					}
					postUtils.cleanPost(user._id, post);
					res.render('partials/post', {post: post});
				});
			});
		});
	});
};