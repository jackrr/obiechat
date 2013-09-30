var mongoose = require('mongoose');
var userSchema = require('../schema/userSchema');
var User = mongoose.model('User', userSchema);

User.all = function(cb) {
	Post.find({},function(err, users) {
		cb(err, users);
	});
};

User.findOrCreateByGoogleID = function(googleID, profile, cb) {
	User.findOne({googleID: googleID}, function(err, user) {
		if (err) {
			return cb(err);
		}
		if (user) {
			return cb(null, user);
		}
		User.create({
			googleID: googleID,
			name: {
				first: profile.name.givenName,
				last: profile.name.familyName
			},
			email: profile.emails[0].value
		}, function(err, user) {
			cb(err, user);
		});
	});
};

module.exports = User;