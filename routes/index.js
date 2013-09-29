/*
 * GET home page.
 */
module.exports = function(app) {
	app.get('/', function(req, res) {
		app.db.Topic.all(function(err, topics) {
			if (err) console.log(err);
			res.render('index', { topics: topics });	
		});
	});
};