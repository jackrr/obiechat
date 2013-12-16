var passport = require('passport');
var GoogleStrategy = require('passport-google').Strategy;
var googlePaths = {};
var config = require('../config.json');

if (config.development) {
	googlePaths.returnURL = 'http://localhost:3000/auth/google/return';
	googlePaths.realm = 'http://localhost:3000/';
} else {
	googlePaths.returnURL = 'http://obiechat.com/auth/google/return';
	googlePaths.realm = 'http://obiechat.com/';
}


module.exports = function(app, events) {
	var errorUtils = require('../utils/errorUtils')(app, events);
	var notifyAll = errorUtils.notifyAll;
	var returnError = errorUtils.error;
	var userAuth = require('../auth/userAuth')(app.db.User);

	var User = app.db.User;
	var PostPage = app.db.PostPage;

	passport.use(new GoogleStrategy(googlePaths, function(identifier, profile, done) {
		User.findOrCreateByGoogleEmail(profile, function(err, user) {
			if (err) {
				return done(null, false, { message: 'Not allowed access'});
			}
			if (!user) {
				return done(null, false, { message: 'Something went wrong'});
			}
			done(null, user);
		});
	}));

	passport.serializeUser(function(user, done) {
		done(null, user._id);
	});

	passport.deserializeUser(function(_id, done) {
		User.findOne({_id: _id}, function(err, user) {
			done(err, user);
		});
	});


	/*
	 * Routes!
	 */

	app.get('/auth/google', passport.authenticate('google'));

	app.get('/auth/google/return', passport.authenticate('google', {
		successRedirect: '/',
		failureRedirect: '/splash'
	}));

	app.get('/signOut', userAuth.signedIn, function(req, res) {
		req.session.destroy();
		res.redirect('/splash');
	});

	app.get('/user/:id', userAuth.isSameUser, function(req, res) {
		User.findById(req.params.id, function(err, user) {
			if(err) return returnError(req, res, 500, 'Failed to access db', err);
			res.render('user', {user: user});
		});
	});

	app.get('/user/:id/edit', userAuth.isSameUser, function(req, res) {
		User.findById(req.params.id, function(err, user) {
			if(err) return returnError(req, res, 500, 'Failed to access db', err);
			res.render('user', {user: user, edit: true});
		});
	});

	app.post('/user/:id/editPseudo', userAuth.isSameUser, function(req, res) {
		User.setNewPseudo(req.params.id, req.body.pseudo, function(err, user) {
			if(err) return returnError(req, res, 500, 'Failed to access db', err);
			PostPage.updatePostsForUser(user, function(err) {
				if (err) console.log(err);
			});
			res.render('user', {user: user});
		});
	});
};