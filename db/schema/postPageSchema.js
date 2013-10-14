var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Post = require('./postSchema');
var maxPostLength = require('../../config.json').postPageSize;

var postPageSchema = new Schema({
	posts: [Post],
	pageNumber: Number,
	topicID: Schema.Types.ObjectId,
	createdDate: {type: Date, default: Date.now}
});

postPageSchema.virtual('postSlots').get(function() {
	return this.posts.length - maxPostLength;
});

module.exports = postPageSchema;