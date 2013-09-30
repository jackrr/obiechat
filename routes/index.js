/*
 * GET home page.
 */
module.exports = function(app) {
	app.get('/', function(req, res) {
		app.db.Topic.all(function(err, topics) {
			if (err) console.log(err);
			console.log(req.user);
			res.render('index', { topics: topics, user: req.user });	
		});
	});
	
	app.get('/join', function(req, res) {
		res.render('join');
	});
};