var _ = require('underscore');

module.exports = function(app, events) {
	var Topic = app.db.Topic;
	var sockets = {};
	
	function addSocket(socket) {
		
		socket.on('watchTopic', function(data) {
			var date = Date.now();
			
			function sendToSocket() {
				Topic.findPostsSince(data.slug, socket.userID, date, function(err, posts) {
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
			
			sockets[socket.id] = sendToSocket;
			events.on('topicChanged'+data.slug, sendToSocket);
			sendToSocket();
			
			socket.on('stopWatchingTopic', function(data) {
				events.removeListener('topicChanged'+data.slug, sendToSocket);
			});
		});
	}
	
	function removeSocket(id) {
		delete sockets[id];
	}

	return {
		addSocket: addSocket,
		removeSocket: removeSocket
	};
};