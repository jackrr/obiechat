/*
 * GET home page.
 */

var userAuth = require('../auth/userAuth');

module.exports = function(app) {
	app.get('/', function(req, res) {
		res.redirect('/splash');
	});
	
	app.get('/splash', function(req, res) {
		res.render('splash');
	});
	
	app.get('/home', userAuth.signedIn, function(req, res) {
		app.db.Topic.all(function(err, topics) {
			if (err) console.log(err);
			res.render('index', { topics: topics, user: req.user });	
		});
	});
	
	app.get('/join', function(req, res) {
		res.render('join');
	});
};