/*
 * GET home page.
 */
module.exports = function(app) {
	app.get('/', function(req, res) {
		app.db.Post.all(function(err, posts) {
			if (err) console.log(err);
			res.render('index', { posts: posts });	
		});
	});
};