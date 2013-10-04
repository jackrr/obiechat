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
		Topic.create(req.body, function(err, topic) {
			if(err) {
				console.log(err);
			}
			console.log('topic made');
			res.redirect('/topic/' + topic.slug);
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
					console.log('adding display name');
					post.creatorName = user.displayName;	
				}
				topic.posts.push(post);
				topic.save(function(err) {
					if(err) {
						console.log(err);
					}
					postUtils.cleanPost(user._id, post);
					res.render('partials/post', {post: post});
				});
			});
		});
	});
};