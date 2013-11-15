var usersOnline = 0;

var sockets = {};

function sendOnlineCount(socket) {
	socket.emit('onlineCount', {count: usersOnline});
}

function sendNotification(socket, data) {
	socket.emit('notification', data);
}



function initialize(app, io, events) {
	var topicSockets = require('./topicSockets')(app, events);

	function watchOnlineCount(socket) {
		sendOnlineCount(socket);
		var functionHolder = sockets[socket.id] = {};
		functionHolder.onlineCount = function() {
			sendOnlineCount(socket);
		};
		functionHolder.sendNotification = function(data) {
			sendNotification(socket, data);
		};
		events.on('usersChanged', functionHolder.onlineCount);
		events.on('newNotification', functionHolder.sendNotification);
	}

	function stopWatchingOnlineCount(id) {
		events.removeListener('usersChanged', sockets[id].onlineCount);
		events.removeListener('newNotification', sockets[id].sendNotification)
		delete sockets[id];
	}

	io.sockets.on('connection', function(socket) {
		socket.userID = socket.handshake.session.passport.user;
		usersOnline++;
		events.emit('usersChanged');

		watchOnlineCount(socket);

		topicSockets.addSocket(socket);

		socket.on('disconnect', function() {
			stopWatchingOnlineCount(socket.id);
			usersOnline--;
			events.emit('usersChanged');
		});
	});
}

module.exports = initialize;