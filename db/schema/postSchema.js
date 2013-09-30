var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dateUtils = require('../../utils/dateUtils');

var postSchema = new Schema({
	creatorID: {type: Schema.Types.ObjectId, required: true},
	creatorName: String,
	body: {type: String, required: true},
	createdDate: {type: Date, default: Date.now}
});

postSchema.virtual('readableCreatedDate').get(function() {
	return dateUtils.getReadableDate(this.createdDate);
});

module.exports = postSchema;