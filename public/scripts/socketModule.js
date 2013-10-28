define(['jquery', 'io', './layoutView'], function($, io, layoutView) {
	var socket;

	function addListeners(socket) {
		socket.on('onlineCount', function(data) {
			layoutView.updateOnlineUsers(data.count);
		});
	}

	function initialize() {
		socket = io.connect('http://obiechat.com/');

		addListeners(socket);
		return socket;
	}

	function getSocket() {
		return socket;
	}

	return {
		newSocket: initialize,
		getSocket: getSocket
	};
});
