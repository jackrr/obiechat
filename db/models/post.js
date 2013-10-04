var mongoose = require('mongoose');
var postSchema = require('../schema/postSchema');
var Post = mongoose.model('Post', postSchema);

Post.all = function(cb) {
	Post.find({},function(err, posts) {
		cb(err, posts);
	});
};

module.exports = Post;