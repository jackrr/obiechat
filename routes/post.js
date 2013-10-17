var postUtils = require('../utils/postUtils');
var userAuth = require('../auth/userAuth');

module.exports = function(app, events) {
	var PostPage = app.db.PostPage;
	var Warn = app.db.Warn;

	app.get('/post/:pageID/:id/warn', userAuth.signedIn, function(req, res) {
		PostPage.findPost(req.params.pageID, req.params.id, function(err, post) {
			if(err) {
				console.log(err);
			}
			postUtils.cleanPost(post, req.user.id, req.params.pageID);
			res.render('partials/warnForm', {post: post});
		});
	});

	app.post('/post/:pageID/:id/warn', userAuth.signedIn, function(req, res) {
		req.body.creatorID = req.user.id;
		var types = req.body.types;
		if (!types && !req.body.other) {
			return console.log('need to specify a type!');
		}
		if (types && !(Object.prototype.toString.call(types) === '[object Array]')) {// check if array
			types = [types];
		}
		var other = req.body.other;
		if (other) {
			if (!types) {
				types = [other];
			} else {
				types.push(other);
			}
		}
		req.body.types = types; // is this redundant?
		var warn = new Warn(req.body);
		// check if similar warnings exist:
		// same creatorID (overwrite), same types (append description and add confirmation)

		PostPage.addWarnToPost(req.params.pageID, req.params.id, warn, function(err, post) {
			if (err) {
				console.log(err);
			}
			// send the warning for confirmation from other users in topic

			// send a preview of the confirmation to this user (so they know that others can approve!)
			res.render('partials/warnConfirmForm', {post: post, userID: req.user.id});
		});
	});

	app.get('/post/:pageID/:id/warn/:warnID/confirm', userAuth.signedIn, function(req, res) {
		PostPage.confirmWarn(req.params.pageID, req.params.id, req.params.warnID, req.user.id, function(err, post) {
			if (err) {
				console.log(err);
			}
			console.log(post.warns);
			console.log(userID);

			res.render('partials/warnConfirm', {response: 'confirm'});
		});
	});

	app.get('/post/:pageID/:id/warn/:warnID/deny', userAuth.signedIn, function(req, res) {
		PostPage.denyWarn(req.params.pageID, req.params.id, req.params.warnID, req.user.id, function(err, post) {
			if (err) {
				console.log(err);
			}
			res.render('partials/warnConfirm', {response: 'deny'});
		});
	});
};