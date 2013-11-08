var models = require('./db/db');
var Topic = models.Topic;
var TopicPopInfo = models.TopicPopInfo;

Topic.collection.ensureIndex({ slug: 1 }, function(err, indslug) {
	if (err) return console.log(err);
	TopicPopInfo.collection.ensureIndex({ slug: 1 }, function(err, indslug2) {
		if (err) return console.log(err);
		TopicPopInfo.collection.ensureIndex({ topicID: 1 }, function(err, topind) {
			if (err) return console.log(err);
			TopicPopInfo.setPopularities(function(err, pairs) {
				if (err) return console.log(err);
				Topic.applyNewPops(pairs, function(err) {
					if (err) return console.log(err);
					Topic.collection.ensureIndex({ popularity: -1 }, function(err, popind) {
						console.log("done: ", err);
					});
				});
			});
		});
	});
});

