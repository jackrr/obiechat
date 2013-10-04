module.exports = function(app) {
	var Post = app.db.Post;
	
	app.get('/posts', function(req, res) {
		res.redirect('/');
	});
	
	app.post('/post', function(req, res) {
		Post.create(req.body, function(err, post) {
			if(err) {
				console.log(err);
			}
			console.log(post.body);
			res.redirect('/');
		});
	});
};