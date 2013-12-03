function signedIn(req, res, next) {
	if (!req.user) {
		console.log('REDIRECTING');
		return res.redirect('/splash');
	};
	next();
};

function isSameUser(req, res, next) {
	if (req.user.id != req.params.id) {
		return res.redirect('/');
	}
	next();
};

function ajaxSignedIn(req, res, next) {
	if (!req.user) {
		return res.send(403, 'not signed in');
	}
	next();
}

module.exports = {
	signedIn: signedIn,
	ajaxSignedIn: ajaxSignedIn,
	isSameUser: isSameUser
};