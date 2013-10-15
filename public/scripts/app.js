define(['jquery', './topicView', './socketModule'], function($, topicView, socketModule) {
	var socket = socketModule.newSocket();

	// if viewing a topic, load the view
	var topicPath = /topic\/show\/\S*[^\/]/i;
	var path = $(location).attr('pathname');
	if (path.match(topicPath) ) {
		topicView.initialize(path, socket);
	}
});