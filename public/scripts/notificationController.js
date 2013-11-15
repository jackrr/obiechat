define(['jquery', 'jquery.autosize'], function($) {
	var watchForEvents = function(element) {
		$(element).children('.close').on('click', function(e) {
			$(element).remove();
		});
	};

	var general = function(html) {
		var $element = $(html);
		$('#notifications .general').append($element);
		watchForEvents($element);
	};

	var error = function(html) {
		var $element = $(html);
		$('#notifications .errors').append($element);
		watchForEvents($element);
	};

	var topic = function(html) {
		var $element = $(html);
		$('#notifications .topic').append($element);
		watchForEvents($element);
	}

	return {
		newError: error,
		newNotification: general,
		topicNotification: topic
	};
});
