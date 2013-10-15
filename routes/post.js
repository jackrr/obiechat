var userAuth = require('../auth/userAuth');

module.exports = function(app, events) {
	var PostPage = app.db.PostPage;

	app.get('/post/:pageID/:id/warn', userAuth.signedIn, function(req, res) {
		PostPage.findPost(req.params.pageID, req.params.id, function(err, post) {
			if(err) {
				console.log(err);
			}
			res.render('warnForm', {post: post});
		});
	});
};