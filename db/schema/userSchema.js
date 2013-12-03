var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var permittedUsers = require('../../permittedUsers.json');

var userSchema = new Schema({
	name: {
		first: {type: String, required: true},
		last: {type: String, required: true},
		pseudo: String
	},
	// email: {type: String, required: true, enum: permittedUsers.users}
	email: {type: String, required: true}
	// email: {type: String, required: true, match: /^[A-Z0-9._%+-]+@oberlin.edu/}
});

userSchema.path('email').validate(function (email) {
   var emailRegex = /^([\w-\.]+@oberlin.edu$/;
   return emailRegex.test(email.text); // Assuming email has a text attribute
}, 'The e-mail must be in the oberlin.edu namespace.')


userSchema.virtual('displayName').get(function() {
	if (this.name.pseudo) {
		return "'" + this.name.pseudo + "' " + this.name.last;
	}
	return this.name.first + ' ' + this.name.last;
});

module.exports = userSchema;
