var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dateUtils = require('../../utils/dateUtils');

var topicSchema = new Schema({
	creatorID: Schema.Types.ObjectId,
	name: {type: String, required: true},
	description: String,
	postPages: [Schema.Types.ObjectId],
	slug: {type: String, required: true},
	anonymous: {type: Boolean, default: false},
	createdDate: {type: Date, default: Date.now},
	popularity: {type: Number, default: 0},

	// non-persisted values
	viewCount: Number,
	newPosts: Boolean
}, { autoIndex: false });

topicSchema.index({popularity: -1});
topicSchema.index({slug: 1});

topicSchema.pre('save', function(next) {
	// clear non-persisted data
	this.viewCount = undefined;
	this.newPosts = undefined;

	next();
});

topicSchema.virtual('readableCreatedDate').get(function() {
	return dateUtils.getReadableDate(this.createdDate);
});

topicSchema.virtual('viewers').get(function() {
	if (this.viewCount === 0) return 'No one viewing';
	if (this.viewCount == 1) return '1 person viewing';
	return this.viewCount + ' people viewing';
});

topicSchema.virtual('preview').get(function() {
	return {
		_id: _id,
		name: name,
		slug: slug,
		createdDate: createdDate
	}
});

module.exports = topicSchema;