var mongoose = require('mongoose');

// connect to db
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var Post = require('./models/post');
var Topic = require('./models/topic');

module.exports = {
		Post: Post,
		Topic: Topic
};