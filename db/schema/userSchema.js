var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	name: {
		first: String,
		last: String,
		pseudo: String
	},
	email: {type: String, required: true}
});

userSchema.virtual('displayName').get(function() {
	if (this.name.pseudo) {
		return this.name.first + " '" + this.name.pseudo + "' " + this.name.last;
	}
	return this.name.first + ' ' + this.name.last;
});

module.exports = userSchema;