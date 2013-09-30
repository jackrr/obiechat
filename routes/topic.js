var userAuth = require('../auth/userAuth');

module.exports = function(app) {
	var Topic = app.db.Topic;
	var Post = app.db.Post;
	var User = app.db.User;
	
	app.get('/topics', userAuth.signedIn, function(req, res) {
		Topic.all(function(err, topics) {
			if(err) {
				console.log(err);
			}
			res.render('topicList', {topics: topics});	
		});
	});
	
	app.get('/topic/new', userAuth.signedIn, function(req, res) {
		// send form to create a topic
		res.render('newTopic');
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
		Topic.findBySlug(req.params.slug, function(err, topic) {
			if(err) {
				console.log(err);
			}
			res.render('topic', {topic: topic});	
		});
	});
	
	app.post('/topic/:slug/post', userAuth.signedIn, function(req, res) {
		// send the topic view
		Topic.findBySlug(req.params.slug, function(err, topic) {
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
				var post = new Post(req.body);
				post.creatorID = users[0]._id;
				console.log(post);
				if (!topic.anonymous) {
					post.creatorName = users[0].displayName;	
				}
				topic.posts.push(post);
				topic.save(function(err) {
					if(err) {
						console.log(err);
					}
					res.redirect('/topic/' + topic.slug);
				});
			});
		});
	});
};