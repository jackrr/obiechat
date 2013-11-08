define(['jquery', 'underscore', 'window'], function($, _, window) {
	var page, $previews;

	function watchTopicPreviewsForClicks() {
		$('.topicPreview').click(function(e) {
			window.location.href = $(e.delegateTarget).find('.topicViewLink').attr('href');
		});
	}

	function fillAndWatchPreviewArea() {
		$previews.scroll(function() {
			
		});
	}

	function initialize() {
		$previews = $('.topicPreviewHolder');
		watchTopicPreviewsForClicks();
		fillAndWatchPreviewArea();
	}

	return {
		initialize: initialize
	}
});