var postUtils = require('../utils/postUtils');
var userAuth = require('../auth/userAuth');

module.exports = function(app, events) {
	var PostPage = app.db.PostPage;
	var Warn = app.db.Warn;
	var WarnGroup = app.db.WarnGroup;
	var Topic = app.db.Topic;
	var self = this;

	function newWarningInPost(pageID, post) {
		PostPage.findById(pageID, function(err, page) {
			if (err) return console.log(err);
			Topic.findById(page.topicID, function(err, topic) {
				if (err) return console.log(err);
				events.emit('newWarning'+topic.slug, post);
			});
		})
	};

	app.get('/post/:pageID/:id/warn', userAuth.signedIn, function(req, res) {
		PostPage.findPost(req.params.pageID, req.params.id, function(err, post) {
			if(err) {
				console.log(err);
			}
			postUtils.cleanPost(post, null, req.params.pageID);
			if (post.warnGroup) {
				WarnGroup.findById(post.warnGroup, function(err, wg) {
					if (err) console.log(err);
					app.render('partials/warnConfirmForm', {post: post, warnGroup: wg, userID: req.user.id}, function(err, html) {
						if (err) console.log(err);
						res.send({warnConfirms: html});
					});
				});
			} else {
				self.sendForm(req, res);
			}
		});
	});

	app.get('/post/:pageID/:id/warn/form', userAuth.signedIn, self.sendForm = function(req, res) {
		PostPage.findPost(req.params.pageID, req.params.id, function(err, post) {
			if(err) {
				console.log(err);
			}
			postUtils.cleanPost(post, null, req.params.pageID);
			app.render('partials/warnForm', {post: post}, function(err, html) {
				if (err) return console.log(err);
				res.send({warnForm: html});
			});
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
		req.body.types = types;
		var warn = new Warn(req.body);

		PostPage.findPost(req.params.pageID, req.params.id, function(err, post) {
			if(err) {
				console.log(err);
				return res.send('oops');
			}
			if (post.warnGroup) {
				WarnGroup.addWarn(post.warnGroup, warn, function(err, wg) {
					if (err) return console.log(err);
					PostPage.incWarn(req.params.pageID, req.params.id, function(err, post) {
						if (err) console.log(err);
						newWarningInPost(req.params.pageID, post);
						res.send({id: post.id, count: post.warnCount});
					});
				});
			} else {
				WarnGroup.create({warns: [warn], postID: post._id}, function(err, wg) {
					if (err) {
						console.log(err);
						return res.send('oops');
					}
					PostPage.setWarnGroupForPost(req.params.pageID, post._id, wg, function(err, post) {
						if (err) {
							console.log(err);
							return res.send('oops');
						}
						newWarningInPost(req.params.pageID, post);
						res.send({id: post.id, count: post.warnCount});
					});
				})
			}
		});
	});

	app.get('/warnGroup/:groupID/:warnID/:pageID/confirm', userAuth.signedIn, function(req, res) {
		WarnGroup.addConfirm(req.params.groupID, req.params.warnID, req.params.userID, function(err, wg) {
			if (err) {
				console.log(err);
				return res.send('oops');
			}
			PostPage.incWarn(req.params.pageID, wg.postID, function(err, post) {
				if (err) {
					console.log(err);
					return res.send('oops');
				}
				res.send({id: post.id, count: post.warnCount});
			});
		});
	});

	app.get('/warnGroup/:groupID/:warnID/:pageID/deny', userAuth.signedIn, function(req, res) {
		console.log('not using this feature yet');
	});
};