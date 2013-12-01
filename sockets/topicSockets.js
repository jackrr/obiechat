var _ = require('underscore');

module.exports = function(app, events) {
	var Topic = app.db.Topic;
	var TopicPopInfo = app.db.TopicPopInfo;
	var topics = {};
	var sockets = [];

	function addSocket(socket) {

		socket.on('watchTopic', function(data) {
			var slug = data.slug;

			if (socket.topic) {
				socket.stopWatching();
			}
			socket.topic = slug;

			var date = Date.now();
			var id = socket.id;
			if (!topics[slug]) {
				topics[slug] = [];
				events.on('topicViewersChanged'+slug, saveViewerCount);
			}
			topics[slug].push(id);

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

			function saveViewerCount() {
				TopicPopInfo.setViewCount(slug, topics[slug].length, function(err, tpi) {
					if (err) return console.log(err);
				});
			}

			function sendViewerCount() {
				socket.emit('topicViewerCount', {count: topics[slug].length});
			}

			function hidePost(post) {
				app.render('partials/post', {post: post}, function(err, html) {
					if (err) {
						return console.log(err);
					}
					socket.emit('hidePost', {id: post._id, html: html});
				});
			}

			function newWarning(post) {
				socket.emit('warnCountChange', {id: post._id, count: post.warnCount});
			}

			events.on('topicChanged'+slug, sendPosts);
			events.on('newWarning'+slug, newWarning);
			events.on('hidePost'+slug, hidePost);
			events.on('topicViewersChanged'+slug, sendViewerCount);
			events.emit('topicViewersChanged'+slug, sendViewerCount);
			sendPosts();

			socket.stopWatching = function() {
				topics[slug] = _.without(topics[slug], id);
				events.removeListener('topicChanged'+slug, sendPosts);
				events.removeListener('topicViewersChanged'+slug, sendViewerCount);
				events.removeListener('newWarning'+slug, newWarning);
				events.removeListener('hidePost'+slug, hidePost);
				events.emit('topicViewersChanged'+slug);
			}

			socket.on('disconnect', function() {
				socket.stopWatching();
			});
		});
	}

	return {
		addSocket: addSocket
	};
};