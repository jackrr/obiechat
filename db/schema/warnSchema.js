var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');

var warnSchema = new Schema({
	creatorID: {type: Schema.Types.ObjectId, required: true},
	types: [String],
	confirmedBy: [Schema.Types.ObjectId],
	description: String,
	createdDate: {type: Date, default: Date.now}
});

warnSchema.pre('save', function(next) {
	// clean up the description text
	this.description = this.description.trim();
	if (this.description && this.description.length) {
		this.description.replace(/\s+/g, ' ');
		this.description = this.description.replace(/\r+/g, '');
		this.description.replace(/\n\n+/g, '\n\n');
	}

	next();
});

warnSchema.methods.confirmedByUser = function(userID) {
	return !(_.indexOf(this.confirmedBy, userID) < 0);
}

var warnTypes = {persAttack: 'A personal attack', discriminatory: 'Discriminatory', disclosure: 'Disloses secure information'}

warnSchema.virtual('prettyTypes').get(function() {
	var pt = '';
	var niceType;
	var self = this;
	_.each(this.types, function(type, index) {
		niceType = warnTypes[type] || type;
		if (index === 0) {
			pt = niceType;
		} else if (index == (self.types.length - 1)) {
			if (index > 1) {
				pt = pt + ', and/or ' + niceType;
			} else {
				pt = pt + ' and/or ' + niceType;
			}
		} else {
			pt = pt + ', ' + niceType;
		}
	});
	return pt;
});

module.exports = warnSchema;