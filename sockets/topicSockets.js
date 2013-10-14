var _ = require('underscore');

module.exports = function(app, events) {
	var Topic = app.db.Topic;
	var topics = {};

	function addSocket(socket) {

		socket.on('watchTopic', function(data) {
			var slug = data.slug;
			var date = Date.now();
			if (!topics[slug]) {
				topics[slug] = 0;
			}
			topics[slug]++;

			function sendPosts() {
				console.log('called send posts');
				Topic.findPostsSince(slug, socket.userID, date, function(err, posts) {
					var ret = {};
					ret.posts = [];

					_.each(posts, function(post) {
						app.render('partials/post', {post: post}, function(err, html) {
							if (err) {
								console.log(err);
							}
							ret.posts.push(html);
						});
					});
					date = Date.now();
					socket.emit('topicUpdated', ret);
				});
			}

			function sendViewerCount() {
				socket.emit('topicViewerCount', {count: topics[slug]});
			}

			events.on('topicChanged'+slug, sendPosts);
			events.on('topicViewersChanged'+slug, sendViewerCount);
			sendViewerCount();
			sendPosts();

			socket.on('stopWatchingTopic', function(data) {
				topics[slug]--;
				events.removeListener('topicChanged'+slug, sendPosts);
				events.removeListener('topicViewersChanged'+slug, sendViewerCount);
			});
		});
	}

	return {
		addSocket: addSocket
	};
};