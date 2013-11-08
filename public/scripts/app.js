define(['jquery', './topicView', './socketModule', './topicListView'], function($, topicView, socketModule, topicListView) {
	var socket = socketModule.newSocket();

	// if viewing a topic, load the view
	var topicPath = /topic\/show\/\S*[^\/]/i;
	var path = $(location).attr('pathname');
	if (path.match(topicPath) ) {
		topicView.initialize(path, socket);
	}

	var topicList = $('.topicList');
	if (topicList) {
		topicListView.initialize();
	}
});