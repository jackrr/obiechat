module.exports = function(app) {
	var Topic = app.db.Topic;
	
	app.get('/topics', function(req, res) {
		Topic.all(function(err, topics) {
			if(err) {
				console.log(err);
			}
			res.render('topicList', {topics: topics});	
		});
	});
	
	app.get('/topic/new', function(req, res) {
		// send form to create a topic
		res.render('newTopic');
	});
	
	app.post('/topic', function(req, res) {
		Topic.create(req.body, function(err, topic) {
			if(err) {
				console.log(err);
			}
			console.log('topic made');
			res.redirect('/topic/' + topic.slug);
		});
	});
	
	app.get('/topic/:slug', function(req, res) {
		// send the topic view
		Topic.findBySlug(req.params.slug, function(err, topic) {
			if(err) {
				console.log(err);
			}
			res.render('topic', {topic: topic});	
		});
	});
	
	app.post('/topic/:slug/post', function(req, res) {
		// send the topic view
		Topic.findBySlug(req.params.slug, function(err, topic) {
			if(err) {
				console.log(err);
			}
			if(!topic.name) {
				res.send(404, "Topic not found");
			}
			topic.posts.push(req.body);
			topic.save(function(err) {
				if(err) {
					console.log(err);
				}
				res.redirect('/topic/' + topic.slug);
			});
		});
	});
};