var models = require('./db/db');
var Topic = models.Topic;
var TopicPopInfo = models.TopicPopInfo;

function exit(err) {
	if (err) {
		console.log(err);
		process.exit(code=1);
	}
	console.log('Done');
	process.exit(code=0);
}

Topic.collection.ensureIndex({ slug: 1 }, function(err, indslug) {
	if (err) return exit(err);
	TopicPopInfo.collection.ensureIndex({ slug: 1 }, function(err, indslug2) {
		if (err) return exit(err);
		TopicPopInfo.collection.ensureIndex({ topicID: 1 }, function(err, topind) {
			if (err) return exit(err);
			TopicPopInfo.setPopularities(function(err, pairs) {
				if (err) return exit(err);
				Topic.applyNewPops(pairs, function(err) {
					if (err) return exit(err);
					Topic.collection.ensureIndex({ popularity: -1 }, function(err, popind) {
						if (err) {
							return exit(err);
						}
						exit();
					});
				});
			});
		});
	});
});

