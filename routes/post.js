
/*
 * GET users listing.
 */
module.exports = function(app) {
	var Post = app.db.Post;
	
	app.get('/posts', function(req, res) {
		res.redirect('/');
	});
	
	app.post('/post', function(req, res) {
		console.log(req.body.body);
		//var post = new Post(req.body);
		Post.create(req.body, function(err, post) {
			if(err) {
				console.log(err);
			}
			console.log(post.body);
			res.redirect('/');
		});
	});
};