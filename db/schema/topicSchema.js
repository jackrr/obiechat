var mongoose = require('mongoose');
var slug = require('slug');
var Schema = mongoose.Schema;
var Post = require('./postSchema');
var maxSlugLen = 25;

var topicSchema = new Schema({
	creatorID: Schema.Types.ObjectId,
	name: {type: String, required: true},
	description: String,
	posts: [Post],
	slug: String,
	createdDate: {type: Date, default: Date.now}
});

topicSchema.pre('validate', function(next) {
	var name = this.name.length < maxSlugLen ? this.name : this.name.substring(0, maxSlugLen);
	var slugFirst = slug(name); // assuming this is the doc being validated!
	
	// check that no identical slug already exists, if so, make it unique somehow!
	this.slug = slugFirst;
	next();
});

module.exports = topicSchema;