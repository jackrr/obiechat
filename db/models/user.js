var mongoose = require('mongoose');
var userSchema = require('../schema/userSchema');
var User = mongoose.model('User', userSchema);

User.all = function(cb) {
	Post.find({},function(err, users) {
		cb(err, users);
	});
};

User.setNewPseudo = function(id, pseudo, cb) {
	User.findOneAndUpdate({_id: id}, { $set: { 'name.pseudo': pseudo } }, cb);
};

User.findOrCreateByGoogleEmail = function(profile, cb) {
	var email = profile.emails[0].value;
	User.findOne({email: email}, function(err, user) {
		if (err) {
			return cb(err);
		}
		if (user) {
			return cb(null, user);
		}
		User.create({
			name: {
				first: profile.name.givenName,
				last: profile.name.familyName
			},
			email: email
		}, function(err, user) {
			cb(err, user);
		});
	});
};

module.exports = User;