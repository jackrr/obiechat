define(['./topicInteraction', './socketModule'], function(topicInteraction, socketModule) {
	socketModule.newSocket();
	topicInteraction.initialize();
});