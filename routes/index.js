/*
 * GET home page.
 */

var userAuth = require('../auth/userAuth');

module.exports = function(app) {

	app.get('/', userAuth.signedIn, function(req, res) {
		app.db.Topic.previewsPage(1, function(err, topics) {
			if (err) return res.send(500);
			res.render('index', { topics: topics, user: req.user });
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