define(['jquery', './socketModule', './topicListView', './notificationController'], function($, socketModule, topicListView, notificationControl) {
	var socket = socketModule.newSocket();

	// if viewing a topic, load the view
	// var topicPath = /topic\/show\/\S*[^\/]/i;
	// var path = $(location).attr('pathname');
	// if (path.match(topicPath) ) {
	// 	topicView.initialize(path, socket);
	// }

	var topicList = $('.topicList');
	if (topicList) {
		topicListView.initialize(socket);
	}

	socket.on('notification', function(data) {
		notificationControl[data.type] ? notificationControl[data.type](data.html) : notificationControl.newNotification(data.html);
	});
});