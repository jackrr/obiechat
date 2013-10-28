var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');
var Warn = require('./warnSchema');

var warnGroupSchema = new Schema({
	postID: {type: Schema.Types.ObjectId, required: true, unique: true},
	warns: [Warn],
	createdDate: {type: Date, default: Date.now}
});

warnGroupSchema.methods.warnValue = function() {
	var score = 0;
	_.each(this.warns, function(warn) {
		score++;
		if (warn.confirmedBy && warn.confirmedBy.length) {
			score = score + warn.confirmedBy.length;
		}
	});
	return score;
};

module.exports = warnGroupSchema;