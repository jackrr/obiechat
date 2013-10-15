var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dateUtils = require('../../utils/dateUtils');

var topicSchema = new Schema({
	creatorID: Schema.Types.ObjectId,
	creatorName: String,
	name: {type: String, required: true},
	description: String,
	postPages: [Schema.Types.ObjectId],
	slug: {type: String, required: true},
	anonymous: {type: Boolean, default: false},
	owned: {type: Boolean, default: false},
	createdDate: {type: Date, default: Date.now}
});

topicSchema.virtual('readableCreatedDate').get(function() {
	return dateUtils.getReadableDate(this.createdDate);
});

module.exports = topicSchema;