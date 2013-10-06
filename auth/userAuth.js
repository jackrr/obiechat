function signedIn(req, res, next) {
	if (!req.user) {
		return res.redirect('/splash');
	};
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
	ajaxSignedIn: ajaxSignedIn
};