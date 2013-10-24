var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');
var Warn = require('./warnSchema');

var warnGroupSchema = new Schema({
	postID: {type: Schema.Types.ObjectId, required: true, unique: true},
	warns: [Warn],
	createdDate: {type: Date, default: Date.now}
});

module.exports = warnGroupSchema;