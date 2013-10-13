var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dateUtils = require('../../utils/dateUtils');

var postSchema = new Schema({
	creatorID: {type: Schema.Types.ObjectId, required: true},
	creatorName: String,
	body: {type: String, required: true},
	createdDate: {type: Date, default: Date.now},
	
	// non-persisted data
	isTheirs: Boolean
});

postSchema.pre('save', function(next) {
	// clear non-persisted data
	this.isTheirs = undefined;
	
	// clean up the body text
	this.body = this.body.trim();
	if (!this.body || !this.body.length) {
		next(new Error('Empty posts not allowed'));
	}
	this.body.replace(/\s+/g, ' ');
	this.body = this.body.replace(/\r+/g, '');
	this.body.replace(/\n\n+/g, '\n\n');
	console.log(this.body);
	next();
});

postSchema.virtual('readableCreatedDate').get(function() {
	return dateUtils.getReadableDate(this.createdDate);
});

module.exports = postSchema;