var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var topicPopInfoSchema = new Schema({
	topicID: Schema.Types.ObjectId,
	slug: String,
	lastPopularity: {type: Number, default: 0},
	viewCount: {type: Number, default: 0},
	postCount: {type: Number, default: 0},
	warnValue: {type: Number, default: 0},
	lastActivity: {type: Date, default: Date.now}
}, { autoIndex: false });

topicPopInfoSchema.index({topicID: 1});
topicPopInfoSchema.index({slug: 1});

topicPopInfoSchema.virtual('age').get(function() {
	return Date.now() - this.lastActivity;
});

module.exports = topicPopInfoSchema;