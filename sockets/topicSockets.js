var _ = require('underscore');

module.exports = function(app, events) {
	var Topic = app.db.Topic;
	var topics = {};

	function addSocket(socket) {

		socket.on('watchTopic', function(data) {
			var slug = data.slug;
			var date = Date.now();
			var id = socket.id;
			if (!topics[slug]) {
				topics[slug] = [];
			}
			topics[slug].push(id);
			events.emit('topicViewersChanged'+slug);

			function sendPosts() {
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
				socket.emit('topicViewerCount', {count: topics[slug].length});
			}

			function newWarning(post) {
				console.log('sending warn count');
				socket.emit('warnCountChange', {id: post._id, count: post.warnCount});
			}

			events.on('topicChanged'+slug, sendPosts);
			events.on('topicViewersChanged'+slug, sendViewerCount);
			events.on('newWarning'+slug, newWarning);
			sendViewerCount();
			sendPosts();

			function stopWatching() {
				topics[slug] = _.without(topics[slug], id);
				events.removeListener('topicChanged'+slug, sendPosts);
				events.removeListener('topicViewersChanged'+slug, sendViewerCount);
				events.removeListener('newWarning'+slug, newWarning);
				events.emit('topicViewersChanged'+slug);
			}

			socket.on('stopWatchingTopic', function(data) {
				stopWatching();
			});

			socket.on('disconnect', function() {
				stopWatching();
			});
		});
	}

	return {
		addSocket: addSocket
	};
};