var postUtils = require('../utils/postUtils');
var _ = require('underscore');
module.exports = function(app, events) {
	var errorUtils = require('../utils/errorUtils')(app, events);
	var notifyAll = errorUtils.notifyAll;
	var returnError = errorUtils.error;
	var userAuth = require('../auth/userAuth')(app.db.User);

	var PostPage = app.db.PostPage;
	var Warn = app.db.Warn;
	var WarnGroup = app.db.WarnGroup;
	var Topic = app.db.Topic;
	var TopicPopInfo = app.db.TopicPopInfo;
	var self = this;

	function newWarningInPost(pageID, post) {
		PostPage.findById(pageID, function(err, page) {
			if (err) return console.log(err);
			if (!page) return console.log('Bad page');
			Topic.findById(page.topicID, function(err, topic) {
				if (err) return console.log(err);
				events.emit('newWarning'+topic.slug, post);
			});
		});
	};

	function hidePost(pageID, post) {
		PostPage.findById(pageID, function(err, page) {
			if (err) return console.log(err);
			if (!page) return console.log('Bad page');
			Topic.findById(page.topicID, function(err, topic) {
				if (err) return console.log(err);
				events.emit('hidePost'+topic.slug, post);
			});
		});
	}

	app.get('/post/:pageID/:id/warn', userAuth.signedIn, function(req, res) {
		PostPage.findPost(req.params.pageID, req.params.id, function(err, post) {
			if(err) {
				return returnError(req, res, 500, "Failed to access db", err);
			}
			if (!post) return returnError(req, res, 404, "Post does not exist");
			postUtils.cleanPost(post, null, req.params.pageID);
			if (post.warnGroup) {
				WarnGroup.findById(post.warnGroup, function(err, wg) {
					if (err) return returnError(req, res, 404, "these warns do not exist");
					app.render('partials/warnConfirmForm', {post: post, warnGroup: wg, userID: req.user.id}, function(err, html) {
						if (err) return returnError(req, res, 500, "Render failure", err);
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
				return returnError(req, res, 500, "Failed to access db", err);
			}
			if (!post) return returnError(req, res, 404, "Post does not exist");
			postUtils.cleanPost(post, null, req.params.pageID);
			app.render('partials/warnForm', {post: post}, function(err, html) {
				if (err) return returnError(req, res, 500, "Render failure", err);
				res.send({warnForm: html});
			});
		});
	});

	app.post('/post/:pageID/:id/warn', userAuth.signedIn, function(req, res) {
		req.body.creatorID = req.user.id;
		var types = req.body.types;
		if (!types && !req.body.other) {
			return returnError(req, res, 403, "Need to specify a topic type!");
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
				return returnError(req, res, 500, "failed to access db", err);
			}
			if (!post) return returnError(req, res, 404, "Post does not exist");
			if (post.warnGroup) {
				WarnGroup.addWarn(post.warnGroup, warn, function(err, wg) {
					if (err) return returnError(req, res, 500, "failed to access db", err);
					PostPage.setWarnCountOnPost(req.params.pageID, req.params.id, wg.warnValue(), function(err, post) {
						if (err) return returnError(req, res, 500, "failed to access db", err);
						newWarningInPost(req.params.pageID, post);
						res.send({id: post.id, count: post.warnCount});
					});
				});
			} else {
				WarnGroup.create({warns: [warn], postID: post._id}, function(err, wg) {
					if (err) return returnError(req, res, 500, "failed to access db", err);
					PostPage.setWarnGroupForPost(req.params.pageID, post._id, wg._id, wg.warnValue(), function(err, post) {
						if (err) return returnError(req, res, 500, "failed to access db", err);
						newWarningInPost(req.params.pageID, post);
						res.send({id: post.id, count: post.warnCount});
					});
				});

				TopicPopInfo.incWarnValue(post.topicID, function(err, tpi) {
					if (err) return console.log("error setting warn value", err);
					console.log("Warn value for topic ", tpi.slug, " set to: ", tpi.warnValue);
				});
			}
		});
	});

	app.get('/warnGroup/:groupID/:warnID/:pageID/confirm', userAuth.signedIn, function(req, res) {
		WarnGroup.addConfirm(req.params.groupID, req.params.warnID, req.user.id, function(err, wg) {
			if (err) return returnError(req, res, 500, "failed to access db", err);
			PostPage.setWarnCountOnPost(req.params.pageID, wg.postID, wg.warnValue(), function(err, post) {
				if (err) return returnError(req, res, 500, "failed to access db", err);
				newWarningInPost(req.params.pageID, post);
				res.send({id: post.id, count: post.warnCount});
			});
			// this happens outside the client's request
			if (wg.fullyWarned) {
				PostPage.hidePost(req.params.pageID, wg.postID, function(err, post) {
					if (err) return returnError(req, res, 500, "failed to access db", err);
					hidePost(req.params.pageID, post);
				});
			}
		});
	});

	app.get('/warnGroup/:groupID/:warnID/:pageID/deny', userAuth.signedIn, function(req, res) {
		console.log('not using this feature yet');
	});
};