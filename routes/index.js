/*
 * GET home page.
 */
var _ = require('underscore');

module.exports = function(app) {

	var TopicPop = app.db.TopicPopInfo;
	var userAuth = require('../auth/userAuth')(app.db.User);

	function popInfos(previews, lastAccess, cb) {
		var queries = previews.length;
		_.each(previews, function(preview) {
			TopicPop.find({topicID: preview._id}, function(err, tp) {
				if (err) return cb(err);
				if (!tp[0]) return cb('no pop info!');
				preview.viewCount = tp[0].viewCount;
				console.log(preview);
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

	app.get('/', userAuth.signedIn, function(req, res) {
		app.db.Topic.previewsPage(1, function(err, topics) {
			if (err) return res.send(500);
			popInfos(topics, req.lastAccess, function(err, previews) {
				if(err) return res.send(500);
				res.render('index', {topics: previews, user: req.user});
			});
		});
	});

	app.get('/splash', function(req, res) {
		res.render('splash', {user: req.user});
	});

	app.get('/terms', function(req, res) {
		res.render('terms', {user: req.user});
	});

	app.get('/relevantThings', function(req, res) {
		res.render('relevantThings', {user: req.user});
	});
};