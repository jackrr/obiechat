
module.exports = function(app, events) {
	var errorUtils = require('../utils/errorUtils')(app, events);
	var returnError = errorUtils.error;
	var userAuth = require('../auth/userAuth')(app.db.User);

	var TopicPop = app.db.TopicPopInfo;

	app.get('/topicPop/previewInfo/:slug/:oldCount', userAuth.signedIn, function(req, res) {
		TopicPop.find({slug: req.params.slug}, function(err, tp) {
			if (err) return returnError(req, res, 500, "Failed to get topic info");
			if (!tp[0]) return returnError(req, res, 404, "Could not find pop info for topic");
			// var newPosts = (Date.parse(req.params.lastCheck) < tp.lastActivity);
			var newPosts = tp.postCount - req.params.oldCount;
			res.send({pop: tp.popularity, viewCount: tp.viewCount, newPostCount: newPostCount})
		});
	});
};