var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
	authorID: Schema.Types.ObjectId,
	body: {type: String, required: true},
	createdDate: {type: Date, default: Date.now}
});

module.exports = postSchema;