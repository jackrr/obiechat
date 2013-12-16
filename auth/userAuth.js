module.exports = function(User) {

	function findUserAndUpLastAccess(req, res, next) {
		User.find({_id: req.user}, function (err, user) {
			if (err || !user) return res.redirect('/splash');
			req.lastAccess = user[0].lastAccess;
			User.findOneAndUpdate({_id: req.user}, { $set: { lastAccess: Date.now()} }, function (err, user) {
				if (err || !user) return res.redirect('/splash');
				req.theUser = user;
				next();
			});
		});
	}

	function signedIn(req, res, next) {
		if (!req.user) {
			return res.redirect('/splash');
		};
		findUserAndUpLastAccess(req, res, next);
	};

	function isSameUser(req, res, next) {
		if (req.user.id != req.params.id) {
			return res.redirect('/');
		}
		findUserAndUpLastAccess(req, res, next);
	};

	function ajaxSignedIn(req, res, next) {
		if (!req.user) {
			return res.send(403, 'not signed in');
		}
		findUserAndUpLastAccess(req, res, next);
	}

	return {
		signedIn: signedIn,
		isSameUser: isSameUser,
		ajaxSignedIn: ajaxSignedIn
	}
};