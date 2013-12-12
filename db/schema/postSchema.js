var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dateUtils = require('../../utils/dateUtils');

var postSchema = new Schema({
	creatorID: {type: Schema.Types.ObjectId, required: true},
	creatorName: String,
	officialName: String,
	body: {type: String, required: true},
	createdDate: {type: Date, default: Date.now},
	warnGroup: Schema.Types.ObjectId,
	warnCount: Number,
	hidden: Boolean,

	// non-persisted data
	isTheirs: Boolean,
	pageID: Schema.Types.ObjectId
});

postSchema.pre('save', function(next) {
	// clear non-persisted data
	this.isTheirs = undefined;
	this.pageID = undefined;

	// clean up the body text
	this.body = this.body.trim();
	this.body.replace(/\s+/g, ' ');
	this.body = this.body.replace(/\r+/g, '');
	this.body.replace(/\n\n+/g, '\n\n');
	if (this.body || !this.body.length) {
		console.log('empty post!');
		next(new Error('Empty posts not allowed'));
	}
	next();
});

postSchema.virtual('readableCreatedDate').get(function() {
	return dateUtils.getReadableDate(this.createdDate);
});

module.exports = postSchema;