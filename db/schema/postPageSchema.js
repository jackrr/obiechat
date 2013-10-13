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

postPageSchema.pre('save', function(next) {
	if (this.posts.length > maxPostLength) {
		next(new Error('Page full'));
	}
	next();
});

module.exports = postPageSchema;