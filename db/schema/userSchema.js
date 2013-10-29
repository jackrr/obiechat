var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var permittedUsers = require('../../permittedUsers.json');

var userSchema = new Schema({
	name: {
		first: {type: String, required: true},
		last: {type: String, required: true},
		pseudo: String
	},
//	email: {type: String, required: true, enum: permittedUsers.users}
	email: {type: String, required: true}
});

userSchema.virtual('displayName').get(function() {
	if (this.name.pseudo) {
		return "'" + this.name.pseudo + "' " + this.name.last;
	}
	return this.name.first + ' ' + this.name.last;
});

module.exports = userSchema;