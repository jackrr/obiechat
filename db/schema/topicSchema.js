var mongoose = require('mongoose');
var slug = require('slug');
var Schema = mongoose.Schema;
var dateUtils = require('../../utils/dateUtils');
var maxSlugLen = 25;

var topicSchema = new Schema({
	creatorID: Schema.Types.ObjectId,
	creatorName: String,
	name: {type: String, required: true},
	description: String,
	postPages: [Schema.Types.ObjectId],
	slug: String,
	anonymous: {type: Boolean, default: false},
	owned: {type: Boolean, default: false},
	createdDate: {type: Date, default: Date.now}
});

topicSchema.pre('validate', function(next) {
	var name = this.name.length < maxSlugLen ? this.name : this.name.substring(0, maxSlugLen);
	var slugFirst = slug(name); // assuming this is the doc being validated!
	
	// TODO: check that no identical slug already exists, if so, make it unique somehow!
	this.slug = slugFirst;
	next();
});

topicSchema.virtual('readableCreatedDate').get(function() {
	return dateUtils.getReadableDate(this.createdDate);
});

topicSchema.statics.addPage = function(id, page, cb) {
	this.collection.findAndModify({_id: id}, [],{ $push: { postPages: page._id}}, function(err, topic) {
		if (err) {
			return cb(err);
		}
		cb(null, page);
	});
}

module.exports = topicSchema;