var usersOnline = 0;
var EventEmitter = require('events').EventEmitter;
var events = new EventEmitter;

var sockets = {};

function sendOnlineCount(socket) {
	socket.emit('onlineCount', {count: usersOnline});
}

function watchOnlineCount(socket) {
	sendOnlineCount(socket);
	sockets[socket.id] = function() {
		sendOnlineCount(socket);
	};
	events.on('usersChanged', sockets[socket.id]);
}

function stopWatchingOnlineCount(id) {
	events.removeListener('usersChanged', sockets[id]);
	delete sockets[id];
}

function initialize(app, io, globalEvents) {
	var topicSockets = require('./topicSockets')(app, globalEvents.topics);
	
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