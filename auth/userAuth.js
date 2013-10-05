function signedIn(req, res, next) {
	if (!req.user) {
		return res.redirect('/splash');
	};
	next();
};

module.exports = {
	signedIn: signedIn	
};