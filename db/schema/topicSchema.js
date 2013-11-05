var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dateUtils = require('../../utils/dateUtils');
var topicPopInfoSchema = require('../schema/topicPopInfoSchema'); // circular reference
var TopicPopInfo = mongoose.model('TPI', topicPopInfoSchema);

var topicSchema = new Schema({
	creatorID: Schema.Types.ObjectId,
	creatorName: String,
	name: {type: String, required: true},
	description: String,
	postPages: [Schema.Types.ObjectId],
	slug: {type: String, required: true},
	anonymous: {type: Boolean, default: false},
	owned: {type: Boolean, default: false},
	createdDate: {type: Date, default: Date.now},
	popularity: {type: Number, default: 0}
}, { autoIndex: false });

topicSchema.index({popularity: -1});
topicSchema.index({slug: 1});

topicSchema.virtual('readableCreatedDate').get(function() {
	return dateUtils.getReadableDate(this.createdDate);
});

topicSchema.virtual('preview').get(function() {
	return {
		_id: _id,
		name: name,
		slug: slug,
		createdDate: createdDate
	}
});

topicSchema.pre('save', function(next) {
	if (this.isNew) {
		return TopicPopInfo.create({
			topicID: this._id,
			slug: this.slug
		}, function(err, tpi){
			next(err);
		});
	}
	next();
});

module.exports = topicSchema;